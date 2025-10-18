import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../database/prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRole, UserStatus } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: DeepMockProxy<AuthService>;

  const mockUser = {
    userId: 'user-1',
    email: 'test@example.com',
    role: UserRole.ADMIN,
    companyId: 'company-1',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockLoginResponse = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    user: {
      id: 'user-1',
      email: 'test@example.com',
      role: UserRole.ADMIN,
      companyId: 'company-1',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockDeep<AuthService>(),
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: JwtService,
          useValue: mockDeep<JwtService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    // Reset all mocks
    mockReset(authService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access and refresh tokens on successful login', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      authService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(result).toEqual(mockLoginResponse);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new access token on valid refresh token', async () => {
      // Arrange
      const refreshDto = {
        refreshToken: 'valid-refresh-token',
      };

      const refreshResponse = {
        access_token: 'new-access-token',
        user: mockUser,
      };

      authService.refreshToken.mockResolvedValue(refreshResponse);

      // Act
      const result = await controller.refresh(refreshDto);

      // Assert
      expect(result).toEqual(refreshResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshDto.refreshToken);
    });

    it('should throw UnauthorizedException on invalid refresh token', async () => {
      // Arrange
      const refreshDto = {
        refreshToken: 'invalid-refresh-token',
      };

      authService.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      // Act & Assert
      await expect(controller.refresh(refreshDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Arrange
      const userId = 'user-1';
      const request = { user: { userId } };

      authService.logout.mockResolvedValue(undefined);

      // Act
      const result = await controller.logout(request);

      // Assert
      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(authService.logout).toHaveBeenCalledWith(userId);
    });
  });

  describe('register', () => {
    it('should register new user and company successfully', async () => {
      // Arrange
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        companyName: 'New Company',
        companyEmail: 'company@example.com',
        phone: '+1234567890',
      };

      authService.register.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toEqual(mockLoginResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw BadRequestException when email already exists', async () => {
      // Arrange
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        companyName: 'New Company',
        companyEmail: 'company@example.com',
        phone: '+1234567890',
      };

      authService.register.mockRejectedValue(new BadRequestException('Email already exists'));

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email successfully', async () => {
      // Arrange
      const forgotPasswordDto = {
        email: 'test@example.com',
      };

      authService.forgotPassword.mockResolvedValue({ message: 'Password reset email sent' });

      // Act
      const result = await controller.forgotPassword(forgotPasswordDto);

      // Assert
      expect(result).toEqual({ message: 'Password reset email sent' });
      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto.email);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      // Arrange
      const resetPasswordDto = {
        token: 'valid-reset-token',
        newPassword: 'newPassword123',
      };

      authService.resetPassword.mockResolvedValue({ message: 'Password reset successfully' });

      // Act
      const result = await controller.resetPassword(resetPasswordDto);

      // Assert
      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword
      );
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      // Arrange
      const resetPasswordDto = {
        token: 'invalid-reset-token',
        newPassword: 'newPassword123',
      };

      authService.resetPassword.mockRejectedValue(new UnauthorizedException('Invalid token'));

      // Act & Assert
      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      // Arrange
      const verifyEmailDto = {
        token: 'valid-verification-token',
      };

      authService.verifyEmail.mockResolvedValue({ message: 'Email verified successfully' });

      // Act
      const result = await controller.verifyEmail(verifyEmailDto);

      // Assert
      expect(result).toEqual({ message: 'Email verified successfully' });
      expect(authService.verifyEmail).toHaveBeenCalledWith(verifyEmailDto.token);
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      // Arrange
      const verifyEmailDto = {
        token: 'invalid-verification-token',
      };

      authService.verifyEmail.mockRejectedValue(new UnauthorizedException('Invalid token'));

      // Act & Assert
      await expect(controller.verifyEmail(verifyEmailDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      // Arrange
      const request = { user: mockUser };

      // Act
      const result = await controller.getProfile(request);

      // Assert
      expect(result).toEqual(mockUser);
    });
  });
});
