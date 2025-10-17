import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsObject, Min } from 'class-validator';
import { SubscriptionPaymentStatus, SubscriptionPaymentMethod } from '@prisma/client';

export class UpdatePaymentDto {
  @ApiProperty({ 
    enum: SubscriptionPaymentStatus, 
    description: 'Payment status' 
  })
  @IsEnum(SubscriptionPaymentStatus)
  @IsOptional()
  status?: SubscriptionPaymentStatus;

  @ApiProperty({ 
    enum: SubscriptionPaymentMethod, 
    description: 'Payment method' 
  })
  @IsEnum(SubscriptionPaymentMethod)
  @IsOptional()
  method?: SubscriptionPaymentMethod;

  @ApiProperty({ description: 'Payment details as JSON object' })
  @IsObject()
  @IsOptional()
  details?: Record<string, any>;

  @ApiProperty({ description: 'Attempted at date' })
  @IsString()
  @IsOptional()
  attemptedAt?: string;

  @ApiProperty({ description: 'Paid at date' })
  @IsString()
  @IsOptional()
  paidAt?: string;

  @ApiProperty({ description: 'Failed at date' })
  @IsString()
  @IsOptional()
  failedAt?: string;

  @ApiProperty({ description: 'Refunded at date' })
  @IsString()
  @IsOptional()
  refundedAt?: string;
}
