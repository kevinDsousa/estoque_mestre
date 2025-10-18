import { ApiProperty } from '@nestjs/swagger';

export class LocationStatsDto {
  @ApiProperty({ description: 'Total de localizações' })
  total: number;

  @ApiProperty({ description: 'Localizações ativas' })
  active: number;

  @ApiProperty({ description: 'Localizações inativas' })
  inactive: number;

  @ApiProperty({ description: 'Total de capacidade' })
  totalCapacity: number;

  @ApiProperty({ description: 'Capacidade utilizada' })
  usedCapacity: number;

  @ApiProperty({ description: 'Percentual de utilização' })
  utilizationPercentage: number;

  @ApiProperty({ description: 'Localizações por tipo' })
  byType: Record<string, number>;

  @ApiProperty({ description: 'Localizações com estoque baixo' })
  lowStockLocations: number;

  @ApiProperty({ description: 'Localizações com estoque alto' })
  highStockLocations: number;
}

