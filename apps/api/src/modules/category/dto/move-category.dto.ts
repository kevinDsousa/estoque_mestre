import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class MoveCategoryDto {
  @ApiProperty({ description: 'New parent category ID (null for root level)', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: 'New sort order', required: false })
  @IsOptional()
  sortOrder?: number;
}
