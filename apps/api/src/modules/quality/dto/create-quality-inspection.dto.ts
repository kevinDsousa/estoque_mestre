import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { QualityStatus } from '@prisma/client';

export class QualityInspectionResultDto {
  @ApiProperty({ description: 'Critério de inspeção', example: 'Aparência' })
  @IsString()
  @IsNotEmpty()
  criteria: string;

  @ApiProperty({ description: 'Valor esperado', example: 'Boa' })
  @IsString()
  @IsNotEmpty()
  expected: string;

  @ApiProperty({ description: 'Valor encontrado', example: 'Boa' })
  @IsString()
  @IsNotEmpty()
  actual: string;

  @ApiProperty({ description: 'Status do critério', enum: ['PASS', 'FAIL', 'WARNING'], example: 'PASS' })
  @IsEnum(['PASS', 'FAIL', 'WARNING'])
  status: 'PASS' | 'FAIL' | 'WARNING';

  @ApiPropertyOptional({ description: 'Observações sobre o critério' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateQualityInspectionDto {
  @ApiProperty({ description: 'ID do produto a ser inspecionado' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Número do lote', example: 'LOTE-2024-001' })
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @ApiProperty({ description: 'Data da inspeção', example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  inspectionDate: string;

  @ApiProperty({ description: 'ID do inspetor responsável' })
  @IsString()
  @IsNotEmpty()
  inspectorId: string;

  @ApiProperty({ 
    description: 'Resultados da inspeção', 
    type: [QualityInspectionResultDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityInspectionResultDto)
  results: QualityInspectionResultDto[];

  @ApiProperty({ 
    description: 'Status da inspeção', 
    enum: QualityStatus, 
    example: QualityStatus.PENDING 
  })
  @IsEnum(QualityStatus)
  status: QualityStatus;

  @ApiPropertyOptional({ description: 'Observações gerais da inspeção' })
  @IsOptional()
  @IsString()
  notes?: string;
}
