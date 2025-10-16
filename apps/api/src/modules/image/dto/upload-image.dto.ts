import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum ImageType {
  USER_AVATAR = 'USER_AVATAR',
  PRODUCT_IMAGE = 'PRODUCT_IMAGE',
  PRODUCT_ATTACHMENT = 'PRODUCT_ATTACHMENT',
  COMPANY_LOGO = 'COMPANY_LOGO',
  BRAND_LOGO = 'BRAND_LOGO',
  CATEGORY_IMAGE = 'CATEGORY_IMAGE',
  VEHICLE_IMAGE = 'VEHICLE_IMAGE',
}

export class UploadImageDto {
  @ApiProperty({ enum: ImageType, description: 'Image type/category' })
  @IsEnum(ImageType)
  type: ImageType;

  @ApiProperty({ description: 'Entity ID this image belongs to' })
  @IsString()
  entityId: string;

  @ApiProperty({ description: 'Image description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Is this image public', default: false })
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ description: 'Image tags', required: false })
  @IsOptional()
  @IsString()
  tags?: string;
}
