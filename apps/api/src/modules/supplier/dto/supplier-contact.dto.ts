import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class SupplierContactDto {
  @ApiProperty({ description: 'Contact person name' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact phone' })
  @IsString()
  @MaxLength(15)
  phone: string;

  @ApiProperty({ description: 'Contact position', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiProperty({ description: 'Is primary contact', default: false })
  @IsOptional()
  isPrimary?: boolean;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
