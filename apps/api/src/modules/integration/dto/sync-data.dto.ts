import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';
import { SyncDirection, SyncEntity } from '@prisma/client';

export class SyncDataDto {
  @ApiProperty({ description: 'ID da integração' })
  @IsString()
  @IsNotEmpty()
  integrationId: string;

  @ApiProperty({ description: 'Entidade a ser sincronizada', enum: SyncEntity })
  @IsEnum(SyncEntity)
  entity: SyncEntity;

  @ApiProperty({ description: 'Direção da sincronização', enum: SyncDirection })
  @IsEnum(SyncDirection)
  direction: SyncDirection;

  @ApiPropertyOptional({ description: 'IDs específicos para sincronizar' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityIds?: string[];

  @ApiPropertyOptional({ description: 'Data de início para sincronização incremental' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Data de fim para sincronização incremental' })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Parâmetros adicionais para a sincronização' })
  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}
