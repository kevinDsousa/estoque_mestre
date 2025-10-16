import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class TransferStockDto {
  @ApiProperty({ description: 'Target location ID' })
  @IsString()
  targetLocationId: string;

  @ApiProperty({ description: 'Quantity to transfer' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Transfer reason' })
  @IsString()
  reason: string;
}
