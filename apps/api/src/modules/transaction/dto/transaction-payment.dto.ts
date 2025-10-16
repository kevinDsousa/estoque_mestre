import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class TransactionPaymentDto {
  @ApiProperty({ description: 'Payment method' })
  @IsString()
  method: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Payment reference', required: false })
  @IsOptional()
  @IsString()
  reference?: string;
}
