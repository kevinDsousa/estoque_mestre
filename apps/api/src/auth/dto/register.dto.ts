import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ 
    description: 'User email address',
    example: 'user@example.com' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'User password',
    example: 'password123',
    minLength: 6 
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    description: 'User first name',
    example: 'John' 
  })
  @IsString()
  firstName: string;

  @ApiProperty({ 
    description: 'User last name',
    example: 'Doe' 
  })
  @IsString()
  lastName: string;

  @ApiProperty({ 
    description: 'User phone number',
    example: '+5511999999999',
    required: false 
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ 
    description: 'Company ID',
    example: 'clx1234567890' 
  })
  @IsString()
  companyId: string;

  @ApiProperty({ 
    enum: UserRole,
    description: 'User role',
    default: UserRole.MANAGER 
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.MANAGER;
}
