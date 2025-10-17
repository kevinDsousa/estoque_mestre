import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CancelSubscriptionDto {
  @ApiProperty({ 
    description: 'Cancel immediately or at period end',
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  immediately?: boolean = false;

  @ApiProperty({ description: 'Cancellation reason', required: false })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ description: 'Feedback about the cancellation', required: false })
  @IsString()
  @IsOptional()
  feedback?: string;
}
