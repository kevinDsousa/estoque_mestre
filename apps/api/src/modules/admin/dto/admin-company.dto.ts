import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';
import { CompanyStatus } from '@prisma/client';

export class ApproveCompanyDto {
  @ApiProperty({ description: 'ID do administrador que está aprovando' })
  @IsString()
  @IsNotEmpty()
  approvedBy: string;

  @ApiPropertyOptional({ description: 'Motivo da aprovação' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Data de início da assinatura', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  subscriptionStartDate?: string;

  @ApiPropertyOptional({ description: 'ID do plano de assinatura' })
  @IsOptional()
  @IsString()
  subscriptionPlanId?: string;
}

export class AdminRejectCompanyDto {
  @ApiProperty({ description: 'ID do administrador que está rejeitando' })
  @IsString()
  @IsNotEmpty()
  rejectedBy: string;

  @ApiProperty({ description: 'Motivo da rejeição' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class SuspendCompanyDto {
  @ApiProperty({ description: 'ID do administrador que está suspendendo' })
  @IsString()
  @IsNotEmpty()
  suspendedBy: string;

  @ApiProperty({ description: 'Motivo da suspensão' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Data de fim da suspensão (se temporária)' })
  @IsOptional()
  suspensionEndDate?: string;
}

export class CompanyQueryDto {
  @ApiPropertyOptional({ description: 'Página', example: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', example: 10, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filtrar por status', enum: CompanyStatus })
  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;

  @ApiPropertyOptional({ description: 'Buscar por texto (nome, CNPJ, email)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Incluir empresas inativas' })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean = false;
}
