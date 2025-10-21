import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional, IsNotEmpty } from 'class-validator';

export class LocationTransferStockDto {
  @ApiProperty({ description: 'ID da localização de origem' })
  @IsString()
  @IsNotEmpty()
  fromLocationId: string;

  @ApiProperty({ description: 'ID da localização de destino' })
  @IsString()
  @IsNotEmpty()
  toLocationId: string;

  @ApiProperty({ description: 'Quantidade a ser transferida' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Motivo da transferência' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Observações adicionais' })
  @IsString()
  @IsOptional()
  notes?: string;
}
