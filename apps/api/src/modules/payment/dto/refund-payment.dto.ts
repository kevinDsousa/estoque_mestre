import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({ description: 'Refund amount in cents (if not provided, full refund)', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  amount?: number;

  @ApiProperty({ 
    description: 'Refund reason',
    enum: ['duplicate', 'fraudulent', 'requested_by_customer'],
    required: false 
  })
  @IsEnum(['duplicate', 'fraudulent', 'requested_by_customer'])
  @IsOptional()
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';

  @ApiProperty({ description: 'Refund notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
