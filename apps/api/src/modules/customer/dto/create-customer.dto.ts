import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';
import { CustomerStatus, CustomerType } from '@prisma/client';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Legal company name (for business customers)', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  legalName?: string;

  @ApiProperty({ description: 'Customer document (CPF/CNPJ)' })
  @IsString()
  @MinLength(11)
  @MaxLength(18)
  document: string;

  @ApiProperty({ enum: CustomerType, description: 'Customer type' })
  @IsEnum(CustomerType)
  type: CustomerType;

  @ApiProperty({ enum: CustomerStatus, description: 'Customer status', default: CustomerStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact phone' })
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone: string;

  @ApiProperty({ description: 'Secondary phone', required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  secondaryPhone?: string;

  @ApiProperty({ description: 'Contact person name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactPerson?: string;

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

  @ApiProperty({ description: 'Customer website', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @ApiProperty({ description: 'Customer description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Credit limit', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiProperty({ description: 'Payment terms in days', default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentTerms?: number;


  @ApiProperty({ description: 'Is VIP customer', default: false })
  @IsOptional()
  @IsBoolean()
  isVip?: boolean;

  @ApiProperty({ description: 'Birth date (for individual customers)', required: false })
  @IsOptional()
  birthDate?: Date;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
