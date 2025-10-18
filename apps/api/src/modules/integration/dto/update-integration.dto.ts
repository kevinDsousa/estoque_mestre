import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateIntegrationDto } from './create-integration.dto';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { IntegrationStatus } from '@prisma/client';

export class UpdateIntegrationDto extends PartialType(CreateIntegrationDto) {
  @ApiPropertyOptional({ description: 'Novo status da integração', enum: IntegrationStatus })
  @IsOptional()
  @IsEnum(IntegrationStatus)
  status?: IntegrationStatus;

  @ApiPropertyOptional({ description: 'Se a integração está ativa' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
