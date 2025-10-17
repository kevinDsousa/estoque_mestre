import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsObject, Min } from 'class-validator';
import { PaymentType, SubscriptionPaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Subscription ID' })
  @IsString()
  subscriptionId: string;

  @ApiProperty({ description: 'Payment amount in cents', example: 15000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'BRL' })
  @IsString()
  @IsOptional()
  currency?: string = 'BRL';

  @ApiProperty({ 
    enum: PaymentType, 
    description: 'Payment type',
    default: PaymentType.SUBSCRIPTION 
  })
  @IsEnum(PaymentType)
  @IsOptional()
  type?: PaymentType = PaymentType.SUBSCRIPTION;

  @ApiProperty({ 
    enum: SubscriptionPaymentMethod, 
    description: 'Payment method',
    default: SubscriptionPaymentMethod.CARD 
  })
  @IsEnum(SubscriptionPaymentMethod)
  @IsOptional()
  method?: SubscriptionPaymentMethod = SubscriptionPaymentMethod.CARD;

  @ApiProperty({ description: 'Payment details as JSON object' })
  @IsObject()
  @IsOptional()
  details?: Record<string, any>;

  @ApiProperty({ description: 'Billing period start date' })
  @IsString()
  billingPeriodStart: string;

  @ApiProperty({ description: 'Billing period end date' })
  @IsString()
  billingPeriodEnd: string;

  @ApiProperty({ description: 'Stripe payment method ID' })
  @IsString()
  @IsOptional()
  stripePaymentMethodId?: string;
}
