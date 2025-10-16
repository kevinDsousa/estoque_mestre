import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ImageType } from './upload-image.dto';

export class ImageQueryDto {
  @ApiProperty({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ enum: ImageType, description: 'Filter by image type', required: false })
  @IsOptional()
  @IsEnum(ImageType)
  type?: ImageType;

  @ApiProperty({ description: 'Filter by entity ID', required: false })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({ description: 'Search by description or tags', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Show only public images', required: false })
  @IsOptional()
  isPublic?: boolean;
}
