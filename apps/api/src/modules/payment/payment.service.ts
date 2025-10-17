import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { SubscriptionPaymentStatus, PaymentType } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, companyId: string) {
    // Verify subscription exists and belongs to company
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id: createPaymentDto.subscriptionId,
        companyId,
      },
      include: {
        plan: true,
        company: {
          select: { id: true, name: true },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Create payment intent with Stripe if using card payment
    let stripePaymentIntentId: string | undefined;
    let stripeChargeId: string | undefined;
    let stripeInvoiceId: string | undefined;

    if (createPaymentDto.method === 'CARD' && createPaymentDto.stripePaymentMethodId) {
      try {
        const paymentIntent = await this.stripeService.createPaymentIntent({
          amount: createPaymentDto.amount,
          currency: createPaymentDto.currency || 'BRL',
          customerId: subscription.stripeCustomerId,
          paymentMethodId: createPaymentDto.stripePaymentMethodId,
          metadata: {
            companyId,
            subscriptionId: createPaymentDto.subscriptionId,
            paymentType: createPaymentDto.type || PaymentType.SUBSCRIPTION,
          },
          description: `Payment for subscription ${subscription.plan.name}`,
        });

        stripePaymentIntentId = paymentIntent.id;
        // Note: charges are not directly accessible on PaymentIntent in newer Stripe API versions
        // We'll get the charge ID from the payment intent status or retrieve it separately if needed
      } catch (error) {
        console.error('Error creating Stripe payment intent:', error);
        throw new BadRequestException('Failed to process payment');
      }
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        companyId,
        subscriptionId: createPaymentDto.subscriptionId,
        stripePaymentIntentId,
        stripeChargeId,
        stripeInvoiceId,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'BRL',
        status: SubscriptionPaymentStatus.PENDING,
        method: createPaymentDto.method || 'CARD',
        type: createPaymentDto.type || PaymentType.SUBSCRIPTION,
        details: createPaymentDto.details || {},
        billingPeriodStart: new Date(createPaymentDto.billingPeriodStart),
        billingPeriodEnd: new Date(createPaymentDto.billingPeriodEnd),
      },
      include: {
        subscription: {
          include: {
            plan: {
              select: { id: true, name: true, type: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return payment;
  }

  async findAll(companyId: string, query: PaymentQueryDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    
    const where: any = { companyId };
    
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.subscriptionId) where.subscriptionId = query.subscriptionId;
    if (query.minAmount !== undefined) where.amount = { ...where.amount, gte: query.minAmount };
    if (query.maxAmount !== undefined) where.amount = { ...where.amount, lte: query.maxAmount };
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }
    
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: query.limit || 20,
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
        },
        include: {
          subscription: {
            include: {
              plan: {
                select: { id: true, name: true, type: true },
              },
            },
          },
          company: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, companyId },
      include: {
        subscription: {
          include: {
            plan: {
              select: { id: true, name: true, type: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findBySubscription(subscriptionId: string, companyId: string) {
    // Verify subscription belongs to company
    const subscription = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, companyId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const payments = await this.prisma.payment.findMany({
      where: { subscriptionId, companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          include: {
            plan: {
              select: { id: true, name: true, type: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return payments;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, companyId: string) {
    const payment = await this.findOne(id, companyId);

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: updatePaymentDto.status,
        method: updatePaymentDto.method,
        details: updatePaymentDto.details,
        attemptedAt: updatePaymentDto.attemptedAt ? new Date(updatePaymentDto.attemptedAt) : undefined,
        paidAt: updatePaymentDto.paidAt ? new Date(updatePaymentDto.paidAt) : undefined,
        failedAt: updatePaymentDto.failedAt ? new Date(updatePaymentDto.failedAt) : undefined,
        refundedAt: updatePaymentDto.refundedAt ? new Date(updatePaymentDto.refundedAt) : undefined,
      },
      include: {
        subscription: {
          include: {
            plan: {
              select: { id: true, name: true, type: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return updatedPayment;
  }

  async remove(id: string, companyId: string) {
    const payment = await this.findOne(id, companyId);

    // Don't allow deletion of successful payments
    if (payment.status === SubscriptionPaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Cannot delete successful payments');
    }

    return this.prisma.payment.delete({
      where: { id },
    });
  }

  async refund(id: string, refundPaymentDto: RefundPaymentDto, companyId: string) {
    const payment = await this.findOne(id, companyId);

    // Check if payment can be refunded
    if (payment.status !== SubscriptionPaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    if (payment.refundedAt) {
      throw new BadRequestException('Payment has already been refunded');
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException('Cannot refund payment without Stripe payment intent');
    }

    try {
      // Create refund with Stripe
      const refund = await this.stripeService.createRefund({
        paymentIntentId: payment.stripePaymentIntentId,
        amount: refundPaymentDto.amount,
        reason: refundPaymentDto.reason,
        metadata: {
          companyId,
          paymentId: payment.id,
          notes: refundPaymentDto.notes || '',
        },
      });

      // Update payment status
      const updatedPayment = await this.prisma.payment.update({
        where: { id },
        data: {
          status: refundPaymentDto.amount && refundPaymentDto.amount < payment.amount 
            ? SubscriptionPaymentStatus.PARTIALLY_REFUNDED 
            : SubscriptionPaymentStatus.REFUNDED,
          refundedAt: new Date(),
          details: {
            ...(payment.details as any),
            refund: {
              id: refund.id,
              amount: refund.amount,
              reason: refund.reason,
              status: refund.status,
              createdAt: refund.created,
            },
          },
        },
        include: {
          subscription: {
            include: {
              plan: {
                select: { id: true, name: true, type: true },
              },
            },
          },
          company: {
            select: { id: true, name: true },
          },
        },
      });

      return updatedPayment;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new BadRequestException('Failed to process refund');
    }
  }

  async getPaymentStats(companyId: string) {
    const [
      totalPayments,
      totalAmount,
      byStatus,
      byMethod,
      recentPayments,
      failedPayments,
    ] = await Promise.all([
      this.prisma.payment.count({ where: { companyId } }),
      this.prisma.payment.aggregate({
        where: { 
          companyId,
          status: SubscriptionPaymentStatus.SUCCEEDED,
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { status: true },
      }),
      this.prisma.payment.groupBy({
        by: ['method'],
        where: { companyId },
        _count: { method: true },
      }),
      this.prisma.payment.count({
        where: {
          companyId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      this.prisma.payment.count({
        where: {
          companyId,
          status: SubscriptionPaymentStatus.FAILED,
        },
      }),
    ]);

    return {
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      byMethod: byMethod.reduce((acc, item) => {
        acc[item.method] = item._count.method;
        return acc;
      }, {}),
      recentPayments,
      failedPayments,
    };
  }

  async confirmPayment(id: string, companyId: string) {
    const payment = await this.findOne(id, companyId);

    if (payment.status !== SubscriptionPaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException('No Stripe payment intent found');
    }

    try {
      // Confirm payment intent with Stripe
      const confirmedPaymentIntent = await this.stripeService.confirmPaymentIntent(payment.stripePaymentIntentId);

      // Update payment status based on Stripe response
      let newStatus: SubscriptionPaymentStatus;
      let paidAt: Date | undefined;
      let failedAt: Date | undefined;

      switch (confirmedPaymentIntent.status) {
        case 'succeeded':
          newStatus = SubscriptionPaymentStatus.SUCCEEDED;
          paidAt = new Date();
          break;
        case 'requires_payment_method':
        case 'requires_confirmation':
        case 'requires_action':
          newStatus = SubscriptionPaymentStatus.PROCESSING;
          break;
        case 'canceled':
          newStatus = SubscriptionPaymentStatus.CANCELED;
          failedAt = new Date();
          break;
        default:
          newStatus = SubscriptionPaymentStatus.FAILED;
          failedAt = new Date();
      }

      const updatedPayment = await this.prisma.payment.update({
        where: { id },
        data: {
          status: newStatus,
          paidAt,
          failedAt,
          attemptedAt: new Date(),
          details: {
            ...(payment.details as any),
            stripeStatus: confirmedPaymentIntent.status,
            lastUpdated: new Date().toISOString(),
          },
        },
        include: {
          subscription: {
            include: {
              plan: {
                select: { id: true, name: true, type: true },
              },
            },
          },
          company: {
            select: { id: true, name: true },
          },
        },
      });

      return updatedPayment;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new BadRequestException('Failed to confirm payment');
    }
  }
}
