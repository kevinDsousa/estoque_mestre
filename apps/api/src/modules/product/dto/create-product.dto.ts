import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ProductStatus, ProductType } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Product description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Product SKU (Stock Keeping Unit)' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  sku: string;

  @ApiProperty({ description: 'Product barcode', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiProperty({ enum: ProductType, description: 'Product type' })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty({ enum: ProductStatus, description: 'Product status', default: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ description: 'Cost price' })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ description: 'Selling price' })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiProperty({ description: 'Current stock quantity' })
  @IsNumber()
  @Min(0)
  currentStock: number;

  @ApiProperty({ description: 'Minimum stock level' })
  @IsNumber()
  @Min(0)
  minStock: number;

  @ApiProperty({ description: 'Maximum stock level', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @ApiProperty({ description: 'Product weight in grams', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ description: 'Product dimensions (length x width x height in cm)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  dimensions?: string;

  @ApiProperty({ description: 'Product color', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiProperty({ description: 'Product brand', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiProperty({ description: 'Product model', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @ApiProperty({ description: 'Product category ID' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Supplier ID', required: false })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ description: 'Track expiration date', default: false })
  @IsOptional()
  @IsBoolean()
  trackExpiration?: boolean;

  @ApiProperty({ description: 'Expiration date', required: false })
  @IsOptional()
  expirationDate?: Date;

  @ApiProperty({ description: 'Product tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Product notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ description: 'Is product taxable', default: true })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @ApiProperty({ description: 'Tax rate percentage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;
}
