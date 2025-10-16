import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, MaxLength } from 'class-validator';
import { NotificationType, NotificationPriority } from '@prisma/client';

export class BulkNotificationDto {
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

  @ApiProperty({ description: 'Target user IDs (empty for all users)', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiProperty({ description: 'Target user roles (empty for all roles)', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userRoles?: string[];

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
  isUrgent?: boolean;

  @ApiProperty({ description: 'Scheduled send date', required: false })
  @IsOptional()
  scheduledAt?: Date;
}
