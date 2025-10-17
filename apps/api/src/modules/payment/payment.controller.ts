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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentService.create(createPaymentDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments with filters' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async findAll(@Query() query: PaymentQueryDto, @Request() req) {
    return this.paymentService.findAll(req.user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({ status: 200, description: 'Payment statistics retrieved successfully' })
  async getStats(@Request() req) {
    return this.paymentService.getPaymentStats(req.user.companyId);
  }

  @Get('subscription/:subscriptionId')
  @ApiOperation({ summary: 'Get payments by subscription' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async findBySubscription(@Param('subscriptionId') subscriptionId: string, @Request() req) {
    return this.paymentService.findBySubscription(subscriptionId, req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.paymentService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @Request() req) {
    return this.paymentService.update(id, updatePaymentDto, req.user.companyId);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm payment with Stripe' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async confirmPayment(@Param('id') id: string, @Request() req) {
    return this.paymentService.confirmPayment(id, req.user.companyId);
  }

  @Patch(':id/refund')
  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async refund(@Param('id') id: string, @Body() refundPaymentDto: RefundPaymentDto, @Request() req) {
    return this.paymentService.refund(id, refundPaymentDto, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete successful payments' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.paymentService.remove(id, req.user.companyId);
  }
}
