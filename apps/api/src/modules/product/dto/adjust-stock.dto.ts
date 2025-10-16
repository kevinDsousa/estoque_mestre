import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ description: 'Stock adjustment quantity (positive for increase, negative for decrease)' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Reason for stock adjustment' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
