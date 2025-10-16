import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationPreferenceDto } from './dto/notification-preference.dto';
import { BulkNotificationDto } from './dto/bulk-notification.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../company/guards/admin.guard';
import { NotificationType, NotificationStatus, NotificationPriority } from '@prisma/client';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a new notification (Admin only)' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    return this.notificationService.create(createNotificationDto, req.user.companyId, req.user.id);
  }

  @Post('bulk')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Send bulk notification (Admin only)' })
  @ApiResponse({ status: 201, description: 'Bulk notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or no target users found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  sendBulk(@Body() bulkNotificationDto: BulkNotificationDto, @Request() req) {
    return this.notificationService.sendBulkNotification(bulkNotificationDto, req.user.companyId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType, description: 'Filter by type' })
  @ApiQuery({ name: 'status', required: false, enum: NotificationStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, enum: NotificationPriority, description: 'Filter by priority' })
  @ApiQuery({ name: 'isUrgent', required: false, type: Boolean, description: 'Filter urgent notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  findAll(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: NotificationType,
    @Query('status') status?: NotificationStatus,
    @Query('priority') priority?: NotificationPriority,
    @Query('isUrgent') isUrgent?: boolean,
  ) {
    return this.notificationService.findAll(
      req.user.companyId,
      req.user.id,
      page,
      limit,
      type,
      status,
      priority,
      isUrgent,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Notification statistics retrieved successfully' })
  getStats(@Request() req) {
    return this.notificationService.getNotificationStats(req.user.companyId, req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  getUnreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.companyId, req.user.id);
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all company notifications (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType, description: 'Filter by type' })
  @ApiQuery({ name: 'status', required: false, enum: NotificationStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, enum: NotificationPriority, description: 'Filter by priority' })
  @ApiQuery({ name: 'isUrgent', required: false, type: Boolean, description: 'Filter urgent notifications' })
  @ApiResponse({ status: 200, description: 'All notifications retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  findAllAdmin(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: NotificationType,
    @Query('status') status?: NotificationStatus,
    @Query('priority') priority?: NotificationPriority,
    @Query('isUrgent') isUrgent?: boolean,
  ) {
    return this.notificationService.findAll(
      req.user.companyId,
      undefined, // No user filter for admin
      page,
      limit,
      type,
      status,
      priority,
      isUrgent,
    );
  }

  @Get('admin/stats')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get company notification statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Company notification statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getAdminStats(@Request() req) {
    return this.notificationService.getNotificationStats(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.notificationService.findOne(id, req.user.companyId, req.user.id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update notification (Admin only)' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto, @Request() req) {
    return this.notificationService.update(id, updateNotificationDto, req.user.companyId, req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationService.markAsRead(id, req.user.companyId, req.user.id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Mark notification as archived' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as archived' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsArchived(@Param('id') id: string, @Request() req) {
    return this.notificationService.markAsArchived(id, req.user.companyId, req.user.id);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all user notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.companyId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.notificationService.remove(id, req.user.companyId, req.user.id);
  }
}
