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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionQueryDto } from './dto/subscription-query.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Request() req) {
    return this.subscriptionService.create(createSubscriptionDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions with filters' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  async findAll(@Query() query: SubscriptionQueryDto, @Request() req) {
    return this.subscriptionService.findAll(req.user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get subscription statistics' })
  @ApiResponse({ status: 200, description: 'Subscription statistics retrieved successfully' })
  async getStats(@Request() req) {
    return this.subscriptionService.getSubscriptionStats(req.user.companyId);
  }

  @Get('payment-status')
  @ApiOperation({ summary: 'Check payment status of subscriptions' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved successfully' })
  async checkPaymentStatus(@Request() req) {
    return this.subscriptionService.checkPaymentStatus(req.user.companyId);
  }

  @Get('company')
  @ApiOperation({ summary: 'Get all subscriptions for the company' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  async findByCompany(@Request() req) {
    return this.subscriptionService.findByCompany(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.subscriptionService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto, @Request() req) {
    return this.subscriptionService.update(id, updateSubscriptionDto, req.user.companyId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async cancel(@Param('id') id: string, @Body() cancelSubscriptionDto: CancelSubscriptionDto, @Request() req) {
    return this.subscriptionService.cancel(id, cancelSubscriptionDto, req.user.companyId);
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate canceled subscription' })
  @ApiResponse({ status: 200, description: 'Subscription reactivated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async reactivate(@Param('id') id: string, @Request() req) {
    return this.subscriptionService.reactivate(id, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiResponse({ status: 200, description: 'Subscription deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete active subscriptions' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.subscriptionService.remove(id, req.user.companyId);
  }
}
