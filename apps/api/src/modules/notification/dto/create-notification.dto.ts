import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationPriority } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType, description: 'Notification type' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ enum: NotificationPriority, description: 'Notification priority', default: NotificationPriority.MEDIUM })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  @MaxLength(1000)
  message: string;

  @ApiProperty({ description: 'Related entity ID (product, transaction, etc.)', required: false })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({ description: 'Related entity type', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  entityType?: string;

  @ApiProperty({ description: 'Additional data as JSON', required: false })
  @IsOptional()
  data?: any;

  @ApiProperty({ description: 'Action URL', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionUrl?: string;

  @ApiProperty({ description: 'Action button text', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  actionText?: string;

  @ApiProperty({ description: 'Is notification urgent', default: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ description: 'Scheduled send date', required: false })
  @IsOptional()
  scheduledAt?: Date;
}
