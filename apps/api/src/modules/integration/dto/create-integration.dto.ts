import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsObject } from 'class-validator';
import { IntegrationType, IntegrationStatus } from '@prisma/client';

export class CreateIntegrationDto {
  @ApiProperty({ description: 'Nome da integração', example: 'ERP Principal' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descrição da integração', example: 'Integração com sistema ERP principal da empresa' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Tipo de integração', enum: IntegrationType, example: IntegrationType.ERP })
  @IsEnum(IntegrationType)
  type: IntegrationType;

  @ApiProperty({ description: 'URL base da API externa', example: 'https://api.erp.com/v1' })
  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @ApiPropertyOptional({ description: 'Chave de API ou token de autenticação' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'Usuário para autenticação' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Senha para autenticação' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'Configurações adicionais da integração' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Intervalo de sincronização em minutos', example: 60 })
  @IsOptional()
  syncInterval?: number;

  @ApiPropertyOptional({ description: 'Se a integração está ativa', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Observações sobre a integração' })
  @IsOptional()
  @IsString()
  notes?: string;
}
