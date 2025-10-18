import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from './auth.service';
import { EmailService } from '../modules/email/email.service';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: DeepMockProxy<PrismaService>;
  let jwtService: DeepMockProxy<JwtService>;
  let configService: DeepMockProxy<ConfigService>;
  let emailService: DeepMockProxy<EmailService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    companyId: 'company-1',
    company: {
      id: 'company-1',
      name: 'Test Company',
      status: 'ACTIVE',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCompany = {
    id: 'company-1',
    name: 'Test Company',
    email: 'company@example.com',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: JwtService,
          useValue: mockDeep<JwtService>(),
        },
        {
          provide: ConfigService,
          useValue: mockDeep<ConfigService>(),
        },
        {
          provide: EmailService,
          useValue: mockDeep<EmailService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    emailService = module.get(EmailService);

    // Reset all mocks
    mockReset(prismaService);
    mockReset(jwtService);
    mockReset(configService);
    mockReset(emailService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword';

      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      mockedBcrypt.compare.mockResolvedValue(true as never);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        companyId: mockUser.companyId,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        status: mockUser.status,
        company: mockUser.company,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { company: true },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';

      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { company: true },
      });
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongPassword';
      const hashedPassword = 'hashedPassword';

      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return null when user status is not ACTIVE', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: UserStatus.INACTIVE,
      });

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when company status is not ACTIVE', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        company: {
          ...mockUser.company,
          status: 'INACTIVE',
        },
      });

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens when login is successful', async () => {
      // Arrange
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.ADMIN,
        companyId: 'company-1',
        firstName: 'John',
        lastName: 'Doe',
        company: mockUser.company,
      };

      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      jwtService.sign.mockReturnValueOnce(accessToken);
      jwtService.sign.mockReturnValueOnce(refreshToken);

      // Act
      const result = await service.login(user);

      // Assert
      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
        },
      });

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshToken', () => {
    it('should return new access token when refresh token is valid', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const userId = 'user-1';
      const newAccessToken = 'new-access-token';

      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        refreshToken,
      });

      jwtService.verify.mockReturnValue({ sub: userId, email: mockUser.email, role: mockUser.role, companyId: mockUser.companyId });
      jwtService.sign.mockReturnValue(newAccessToken);

      // Act
      const result = await service.refreshToken(refreshToken);

      // Assert
      expect(result).toEqual({
        access_token: newAccessToken,
      });

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: undefined,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: userId,
        role: mockUser.role,
        companyId: mockUser.companyId,
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';

      jwtService.verify.mockImplementation(() => { throw new Error('Invalid token'); });

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const userId = 'nonexistent-user';

      jwtService.verifyAsync.mockResolvedValue({ sub: userId });
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh tokens do not match', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const userId = 'user-1';

      jwtService.verifyAsync.mockResolvedValue({ sub: userId });
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        refreshToken: 'different-refresh-token',
      });

      // Act & Assert
      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should return success message when logout is successful', async () => {
      // Arrange
      const userId = 'user-1';

      // Act
      const result = await service.logout(userId);

      // Assert
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('register', () => {
    it('should create new user and company when registration is successful', async () => {
      // Arrange
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567890',
        companyId: 'company-1',
      };

      const hashedPassword = 'hashedPassword';
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      // Mock user not found first (for existing user check)
      prismaService.user.findUnique.mockResolvedValueOnce(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      prismaService.company.findUnique.mockResolvedValue(mockCompany);
      prismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        password: hashedPassword,
        companyId: registerDto.companyId,
      });

      jwtService.sign.mockReturnValueOnce(accessToken);
      jwtService.sign.mockReturnValueOnce(refreshToken);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: mockUser.id,
          email: registerDto.email,
          role: UserRole.MANAGER,
          companyId: registerDto.companyId,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          company: mockUser.company,
        },
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: registerDto.companyId },
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567890',
        companyId: 'company-1',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token when user exists', async () => {
      // Arrange
      const email = 'test@example.com';
      const resetToken = 'reset-token';

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue(resetToken as never);

      // Act
      const result = await service.forgotPassword(email);

      // Assert
      expect(result).toEqual({ message: 'Password reset email sent' });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { 
          passwordResetToken: resetToken,
          passwordResetExpires: expect.any(Date),
        },
      });
    });

    it('should not throw error when user does not exist (security)', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.forgotPassword(email);

      // Assert
      expect(result).toEqual({ message: 'If the email exists, a reset link was sent' });
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password when token is valid', async () => {
      // Arrange
      const resetToken = 'valid-reset-token';
      const newPassword = 'newPassword123';
      const hashedPassword = 'hashedNewPassword';
      const userId = 'user-1';

      prismaService.user.findFirst.mockResolvedValue({
        ...mockUser,
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes from now
      });
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      // Act
      const result = await service.resetPassword(resetToken, newPassword);

      // Assert
      expect(result).toEqual({ message: 'Password updated successfully' });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      // Arrange
      const resetToken = 'invalid-reset-token';
      const newPassword = 'newPassword123';

      prismaService.user.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword(resetToken, newPassword)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      const resetToken = 'valid-reset-token';
      const newPassword = 'newPassword123';

      prismaService.user.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword(resetToken, newPassword)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email when token is valid', async () => {
      // Arrange
      const verificationToken = 'valid-verification-token';
      const userId = 'user-1';

      prismaService.user.findFirst.mockResolvedValue({
        ...mockUser,
        emailVerificationToken: verificationToken,
        emailVerified: false,
      });

      // Act
      const result = await service.verifyEmail(verificationToken);

      // Assert
      expect(result).toEqual({ message: 'Email verified successfully' });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { emailVerified: true },
      });
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      // Arrange
      const verificationToken = 'invalid-verification-token';

      prismaService.user.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyEmail(verificationToken)).rejects.toThrow(UnauthorizedException);
    });
  });
});
