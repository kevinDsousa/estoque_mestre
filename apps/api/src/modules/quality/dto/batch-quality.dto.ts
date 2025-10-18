import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { BatchStatus } from '@prisma/client';

export class CreateProductBatchDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Número do lote', example: 'LOTE-2024-001' })
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @ApiProperty({ description: 'Data de fabricação', example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  manufacturingDate: string;

  @ApiProperty({ description: 'Data de validade', example: '2025-01-01T00:00:00Z' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ description: 'ID do fornecedor' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty({ description: 'Quantidade do lote', example: 100 })
  quantity: number;

  @ApiProperty({ description: 'Preço unitário do lote', example: 10.50 })
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Localização do lote' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Observações do lote' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProductBatchDto {
  @ApiPropertyOptional({ description: 'Novo status do lote', enum: BatchStatus })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @ApiPropertyOptional({ description: 'Nova quantidade' })
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Nova localização' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Observações adicionais' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BatchQualityStatusDto {
  @ApiProperty({ description: 'ID do lote' })
  batchId: string;

  @ApiProperty({ description: 'Status de qualidade', enum: ['APPROVED', 'REJECTED', 'PENDING'] })
  qualityStatus: 'APPROVED' | 'REJECTED' | 'PENDING';

  @ApiPropertyOptional({ description: 'Motivo da aprovação/rejeição' })
  reason?: string;

  @ApiPropertyOptional({ description: 'ID da inspeção relacionada' })
  inspectionId?: string;
}
