import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsNumber, MinLength, MaxLength } from 'class-validator';
import { CompanyType } from '@prisma/client';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Legal company name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  legalName: string;

  @ApiProperty({ description: 'Company document (CNPJ)' })
  @IsString()
  @MinLength(14)
  @MaxLength(18)
  document: string;

  @ApiProperty({ enum: CompanyType, description: 'Company type' })
  @IsEnum(CompanyType)
  type: CompanyType;

  @ApiProperty({ description: 'Street address' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  street: string;

  @ApiProperty({ description: 'Address number' })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  number: string;

  @ApiProperty({ description: 'Address complement', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  complement?: string;

  @ApiProperty({ description: 'Neighborhood' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  neighborhood: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({ description: 'State' })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  state: string;

  @ApiProperty({ description: 'ZIP code' })
  @IsString()
  @MinLength(8)
  @MaxLength(9)
  zipCode: string;

  @ApiProperty({ description: 'Country', default: 'Brasil' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact phone' })
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone: string;

  @ApiProperty({ description: 'Company website', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @ApiProperty({ description: 'Company description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Low stock threshold', default: 10 })
  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number;

  @ApiProperty({ description: 'Enable auto reorder', default: false })
  @IsOptional()
  @IsBoolean()
  autoReorderEnabled?: boolean;

  @ApiProperty({ description: 'Track expiration', default: false })
  @IsOptional()
  @IsBoolean()
  trackExpiration?: boolean;
}
