import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../modules/email/email.service';
import { SessionCacheService } from '../common/cache/session-cache.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from '../modules/user/dto/change-password.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private sessionCacheService: SessionCacheService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, deviceId?: string, ipAddress?: string, userAgent?: string) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      companyId: user.companyId 
    };
    
    // Criar sessão no cache
    const sessionId = await this.sessionCacheService.createSession(
      user.id,
      user.companyId,
      deviceId || 'unknown',
      [user.role], // Permissões baseadas no role
      ipAddress,
      userAgent,
    );
    
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
      session_id: sessionId,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        company: user.company,
      },
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
      const newAccessToken = this.jwtService.sign({
        email: payload.email,
        sub: payload.sub,
        role: payload.role,
        companyId: payload.companyId,
      });
      return { access_token: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { email },
      include: { company: true }
    });
    if (!user) return { message: 'If the email exists, a reset link was sent' };

    const token = await bcrypt.hash(user.id + Date.now().toString(), 5);
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    });

    // Send password reset email
    const resetLink = `${this.configService.get('app.frontendUrl')}/reset-password?token=${token}`;
    await this.emailService.sendPasswordReset({
      name: user.firstName,
      email: user.email,
      resetLink,
      companyName: user.company?.name,
    });
    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });
    if (!user) throw new UnauthorizedException('Invalid or expired token');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    return { message: 'Password updated successfully' };
  }

  async sendEmailVerification(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });
    if (!user) throw new NotFoundException('User not found');

    const token = await bcrypt.hash(userId + Date.now().toString(), 5);
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken: token },
    });
    // Send email verification
    const verificationLink = `${this.configService.get('app.frontendUrl')}/verify-email?token=${token}`;
    await this.emailService.sendEmailVerification({
      name: user.firstName,
      email: user.email,
      verificationLink,
      companyName: user.company?.name,
    });
    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({ where: { emailVerificationToken: token } });
    if (!user) throw new UnauthorizedException('Invalid token');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null },
    });
    return { message: 'Email verified successfully' };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Verify company exists
    const company = await this.prisma.company.findUnique({
      where: { id: registerDto.companyId },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        companyId: registerDto.companyId,
        role: registerDto.role || UserRole.MANAGER,
        status: 'ACTIVE',
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    // Generate tokens
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      companyId: user.companyId 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        company: user.company,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // Verify new password confirmation
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async logout(userId: string, sessionId?: string) {
    // Remover sessão específica ou todas as sessões do usuário
    if (sessionId) {
      await this.sessionCacheService.removeSession(sessionId);
    } else {
      await this.sessionCacheService.removeAllUserSessions(userId);
    }
    
    return { message: 'Logged out successfully' };
  }

  async validateRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Verify user still exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { company: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or inactive');
      }

      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
