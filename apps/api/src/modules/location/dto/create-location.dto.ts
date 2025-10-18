import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min, MaxLength, IsNotEmpty } from 'class-validator';
import { LocationType } from '@prisma/client';

export class CreateLocationDto {
  @ApiProperty({ description: 'Nome da localização' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Descrição da localização' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Código único da localização' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ 
    description: 'Tipo da localização',
    enum: LocationType,
    example: LocationType.WAREHOUSE
  })
  @IsEnum(LocationType)
  type: LocationType;

  @ApiPropertyOptional({ description: 'Endereço da localização' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: 'Cidade' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Estado' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'CEP' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({ description: 'País', default: 'Brasil' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'ID da localização pai (para hierarquia)' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Se a localização está ativa', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Capacidade máxima da localização' })
  @IsInt()
  @IsOptional()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Metadados adicionais da localização' })
  @IsOptional()
  metadata?: any;
}

