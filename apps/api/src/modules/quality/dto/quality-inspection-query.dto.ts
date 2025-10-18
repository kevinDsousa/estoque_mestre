import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { QualityStatus } from '@prisma/client';

export class QualityInspectionQueryDto {
  @ApiPropertyOptional({ description: 'Página', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', example: 10, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filtrar por produto' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por lote' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Filtrar por inspetor' })
  @IsOptional()
  @IsString()
  inspectorId?: string;

  @ApiPropertyOptional({ 
    description: 'Filtrar por status', 
    enum: QualityStatus 
  })
  @IsOptional()
  @IsEnum(QualityStatus)
  status?: QualityStatus;

  @ApiPropertyOptional({ description: 'Data de início (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data de fim (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Buscar por texto (produto, lote, inspetor)' })
  @IsOptional()
  @IsString()
  search?: string;
}
