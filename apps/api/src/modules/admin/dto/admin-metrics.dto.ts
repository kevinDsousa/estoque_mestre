import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessMetricType } from '@prisma/client';

export enum MetricPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export class CreateBusinessMetricDto {
  @ApiProperty({ description: 'Tipo de métrica', enum: BusinessMetricType })
  @IsEnum(BusinessMetricType)
  type: BusinessMetricType;

  @ApiProperty({ description: 'Período da métrica', enum: MetricPeriod })
  @IsEnum(MetricPeriod)
  period: MetricPeriod;

  @ApiProperty({ description: 'Início do período', example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: 'Fim do período', example: '2024-01-31T23:59:59Z' })
  @IsDateString()
  periodEnd: string;

  @ApiProperty({ description: 'Valor da métrica', example: 15000.50 })
  value: number;

  @ApiPropertyOptional({ description: 'Metadados adicionais' })
  @IsOptional()
  metadata?: any;
}

export class BusinessMetricQueryDto {
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

  @ApiPropertyOptional({ description: 'Filtrar por tipo de métrica', enum: BusinessMetricType })
  @IsOptional()
  @IsEnum(BusinessMetricType)
  type?: BusinessMetricType;

  @ApiPropertyOptional({ description: 'Filtrar por período', enum: MetricPeriod })
  @IsOptional()
  @IsEnum(MetricPeriod)
  period?: MetricPeriod;

  @ApiPropertyOptional({ description: 'Data de início (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data de fim (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'ID da empresa (para admin global)' })
  @IsOptional()
  @IsString()
  companyId?: string;
}

export class GlobalMetricsDto {
  @ApiProperty({ description: 'Total de empresas' })
  totalCompanies: number;

  @ApiProperty({ description: 'Empresas ativas' })
  activeCompanies: number;

  @ApiProperty({ description: 'Empresas pendentes' })
  pendingCompanies: number;

  @ApiProperty({ description: 'Empresas suspensas' })
  suspendedCompanies: number;

  @ApiProperty({ description: 'Total de usuários' })
  totalUsers: number;

  @ApiProperty({ description: 'Usuários ativos' })
  activeUsers: number;

  @ApiProperty({ description: 'Total de produtos' })
  totalProducts: number;

  @ApiProperty({ description: 'Total de transações' })
  totalTransactions: number;

  @ApiProperty({ description: 'Receita total' })
  totalRevenue: number;

  @ApiProperty({ description: 'Uso de storage (bytes)' })
  storageUsage: number;

  @ApiProperty({ description: 'API calls no período' })
  apiCalls: number;

  @ApiProperty({ description: 'Período das métricas' })
  period: {
    start: string;
    end: string;
  };
}
