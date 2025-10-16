import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class NotificationPreferenceDto {
  @ApiProperty({ enum: NotificationType, description: 'Notification type' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Enable email notifications', default: true })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiProperty({ description: 'Enable push notifications', default: true })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiProperty({ description: 'Enable in-app notifications', default: true })
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;
}
