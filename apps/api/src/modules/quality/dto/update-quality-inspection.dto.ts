import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQualityInspectionDto } from './create-quality-inspection.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { QualityStatus } from '@prisma/client';

export class UpdateQualityInspectionDto extends PartialType(CreateQualityInspectionDto) {
  @ApiPropertyOptional({ 
    description: 'Novo status da inspeção', 
    enum: QualityStatus 
  })
  @IsOptional()
  @IsEnum(QualityStatus)
  status?: QualityStatus;

  @ApiPropertyOptional({ description: 'Observações adicionais' })
  @IsOptional()
  notes?: string;
}
