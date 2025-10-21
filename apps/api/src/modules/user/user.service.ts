import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, companyId: string, createdBy: string) {
    // Check if user with same email already exists in company
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
        companyId,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in your company');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        role: createUserDto.role || UserRole.MANAGER,
        status: createUserDto.status || UserStatus.ACTIVE,
        companyId,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            transactions: true,
            inventoryMovements: true,
          },
        },
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    role?: UserRole,
    status?: UserStatus,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = { companyId };
    
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              transactions: true,
              inventoryMovements: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
      include: {
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            transactions: true,
            inventoryMovements: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto, companyId: string, updatedBy: string) {
    const user = await this.findOne(id, companyId);

    // Check if email is being changed and if it's unique
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          companyId,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists in your company');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email: updateUserDto.email,
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        phone: updateUserDto.phone,
        role: updateUserDto.role,
        status: updateUserDto.status,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            transactions: true,
            inventoryMovements: true,
          },
        },
      },
    });
  }

  async remove(id: string, companyId: string, deletedBy: string) {
    const user = await this.findOne(id, companyId);

    // Check if user can be deleted
    const userWithCounts = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
            inventoryMovements: true,
          },
        },
      },
    });

    if (userWithCounts?._count?.transactions && userWithCounts._count.transactions > 0) {
      throw new BadRequestException('Cannot delete user with transaction history');
    }

    if (userWithCounts?._count?.inventoryMovements && userWithCounts._count.inventoryMovements > 0) {
      throw new BadRequestException('Cannot delete user with inventory movement history');
    }

    // Don't actually delete, just deactivate
    return this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.INACTIVE,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            transactions: true,
            inventoryMovements: true,
          },
        },
      },
    });
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto, companyId: string) {
    const user = await this.findOne(id, companyId);

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        phone: updateProfileDto.phone,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            transactions: true,
            inventoryMovements: true,
          },
        },
      },
    });
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Verify new password confirmation
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async updatePreferences(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const merged = {
      ...(user.preferences as any || {}),
      ...(dto || {}),
    };
    return this.prisma.user.update({
      where: { id: userId },
      data: { preferences: merged as any },
      select: { id: true, preferences: true },
    });
  }

  async updateUserStatus(id: string, status: UserStatus, companyId: string, updatedBy: string) {
    await this.findOne(id, companyId); // Verify user exists

    return this.prisma.user.update({
      where: { id },
      data: { 
        status,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            transactions: true,
            inventoryMovements: true,
          },
        },
      },
    });
  }

  async updateUserRole(id: string, role: UserRole, companyId: string, updatedBy: string) {
    await this.findOne(id, companyId); // Verify user exists

    return this.prisma.user.update({
      where: { id },
      data: { 
        role,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            transactions: true,
            inventoryMovements: true,
          },
        },
      },
    });
  }

  async getUserStats(companyId: string) {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      usersWithTransactions,
      totalTransactions,
    ] = await Promise.all([
      this.prisma.user.count({ where: { companyId } }),
      this.prisma.user.count({ where: { companyId, status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { companyId, role: UserRole.ADMIN } }),
      this.prisma.user.count({
        where: {
          companyId,
          transactions: { some: {} },
        },
      }),
      this.prisma.transaction.count({
        where: { companyId },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      usersWithTransactions,
      totalTransactions,
    };
  }

  async getRecentUsers(companyId: string, limit: number = 10) {
    const users = await this.prisma.user.findMany({
      where: { companyId, status: UserStatus.ACTIVE },
      orderBy: { lastLoginAt: 'desc' },
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return users;
  }
}
