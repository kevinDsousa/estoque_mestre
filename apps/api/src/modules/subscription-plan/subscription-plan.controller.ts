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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionPlanService } from './subscription-plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlanQueryDto } from './dto/subscription-plan-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('subscription-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscription-plans')
export class SubscriptionPlanController {
  constructor(private readonly subscriptionPlanService: SubscriptionPlanService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiResponse({ status: 201, description: 'Subscription plan created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Plan with this slug already exists' })
  async create(@Body() createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanService.create(createSubscriptionPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans with filters' })
  @ApiResponse({ status: 200, description: 'Subscription plans retrieved successfully' })
  async findAll(@Query() query: SubscriptionPlanQueryDto) {
    return this.subscriptionPlanService.findAll(query);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public subscription plans' })
  @ApiResponse({ status: 200, description: 'Public subscription plans retrieved successfully' })
  async findPublic() {
    return this.subscriptionPlanService.findPublic();
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular subscription plans' })
  @ApiResponse({ status: 200, description: 'Popular subscription plans retrieved successfully' })
  async getPopularPlans(@Query('limit') limit?: number) {
    return this.subscriptionPlanService.getPopularPlans(limit);
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended subscription plans' })
  @ApiResponse({ status: 200, description: 'Recommended subscription plans retrieved successfully' })
  async getRecommendedPlans(@Query('limit') limit?: number) {
    return this.subscriptionPlanService.getRecommendedPlans(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get subscription plan statistics' })
  @ApiResponse({ status: 200, description: 'Subscription plan statistics retrieved successfully' })
  async getStats() {
    return this.subscriptionPlanService.getPlanStats();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get subscription plan by slug' })
  @ApiResponse({ status: 200, description: 'Subscription plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription plan not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.subscriptionPlanService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription plan by ID' })
  @ApiResponse({ status: 200, description: 'Subscription plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription plan not found' })
  async findOne(@Param('id') id: string) {
    return this.subscriptionPlanService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiResponse({ status: 200, description: 'Subscription plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Subscription plan not found' })
  @ApiResponse({ status: 409, description: 'Plan with this slug already exists' })
  async update(@Param('id') id: string, @Body() updateSubscriptionPlanDto: UpdateSubscriptionPlanDto) {
    return this.subscriptionPlanService.update(id, updateSubscriptionPlanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription plan' })
  @ApiResponse({ status: 200, description: 'Subscription plan deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete plan with active subscriptions' })
  @ApiResponse({ status: 404, description: 'Subscription plan not found' })
  async remove(@Param('id') id: string) {
    return this.subscriptionPlanService.remove(id);
  }
}
