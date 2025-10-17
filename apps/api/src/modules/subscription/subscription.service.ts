import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionQueryDto } from './dto/subscription-query.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { SubscriptionStatus, SubscriptionPaymentStatus } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto, companyId: string) {
    // Verify plan exists and is active
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: {
        id: createSubscriptionDto.planId,
        status: 'ACTIVE',
      },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found or inactive');
    }

    // Check if company already has an active subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        companyId,
        status: {
          in: ['ACTIVE', 'PAST_DUE'],
        },
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('Company already has an active subscription');
    }

    // Create subscription with Stripe if using Stripe
    let stripeSubscriptionId: string | undefined;

    if (createSubscriptionDto.stripeCustomerId && createSubscriptionDto.stripePriceId) {
      try {
        const stripeSubscription = await this.stripeService.createSubscription({
          customerId: createSubscriptionDto.stripeCustomerId,
          priceId: createSubscriptionDto.stripePriceId,
          paymentMethodId: createSubscriptionDto.stripePaymentMethodId,
          trialPeriodDays: createSubscriptionDto.isInTrial ? 30 : undefined, // Default 30 days trial
          metadata: {
            companyId,
            planId: createSubscriptionDto.planId,
          },
        });

        stripeSubscriptionId = stripeSubscription.id;
      } catch (error) {
        console.error('Error creating Stripe subscription:', error);
        throw new BadRequestException('Failed to create subscription with payment provider');
      }
    }

    // Create subscription record
    const subscription = await this.prisma.subscription.create({
      data: {
        companyId,
        planId: createSubscriptionDto.planId,
        stripeCustomerId: createSubscriptionDto.stripeCustomerId,
        stripeSubscriptionId,
        stripePriceId: createSubscriptionDto.stripePriceId,
        amount: createSubscriptionDto.amount,
        currency: createSubscriptionDto.currency || 'BRL',
        interval: createSubscriptionDto.interval || 'month',
        intervalCount: createSubscriptionDto.intervalCount || 1,
        features: createSubscriptionDto.features || {},
        billing: createSubscriptionDto.billing || {},
        trialStart: createSubscriptionDto.trialStart ? new Date(createSubscriptionDto.trialStart) : undefined,
        trialEnd: createSubscriptionDto.trialEnd ? new Date(createSubscriptionDto.trialEnd) : undefined,
        isInTrial: createSubscriptionDto.isInTrial || false,
        currentPeriodStart: new Date(createSubscriptionDto.currentPeriodStart),
        currentPeriodEnd: new Date(createSubscriptionDto.currentPeriodEnd),
        nextBillingDate: createSubscriptionDto.nextBillingDate ? new Date(createSubscriptionDto.nextBillingDate) : undefined,
      },
      include: {
        plan: {
          select: { id: true, name: true, type: true, description: true },
        },
        company: {
          select: { id: true, name: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return subscription;
  }

  async findAll(companyId: string, query: SubscriptionQueryDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    
    const where: any = { companyId };
    
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.planId) where.planId = query.planId;
    if (query.minAmount !== undefined) where.amount = { ...where.amount, gte: query.minAmount };
    if (query.maxAmount !== undefined) where.amount = { ...where.amount, lte: query.maxAmount };
    if (query.interval) where.interval = query.interval;
    if (query.isInTrial !== undefined) where.isInTrial = query.isInTrial;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }
    
    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: query.limit || 20,
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
        },
        include: {
          plan: {
            select: { id: true, name: true, type: true, description: true },
          },
          company: {
            select: { id: true, name: true },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id, companyId },
      include: {
        plan: {
          select: { id: true, name: true, type: true, description: true },
        },
        company: {
          select: { id: true, name: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async findByCompany(companyId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: {
          select: { id: true, name: true, type: true, description: true },
        },
        company: {
          select: { id: true, name: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return subscriptions;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto, companyId: string) {
    const subscription = await this.findOne(id, companyId);

    // Update Stripe subscription if needed
    if (subscription.stripeSubscriptionId && updateSubscriptionDto.status) {
      try {
        if (updateSubscriptionDto.status === SubscriptionStatus.CANCELED) {
          await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId, false);
        }
      } catch (error) {
        console.error('Error updating Stripe subscription:', error);
        // Continue with database update even if Stripe update fails
      }
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: updateSubscriptionDto.status,
        paymentStatus: updateSubscriptionDto.paymentStatus,
        features: updateSubscriptionDto.features,
        billing: updateSubscriptionDto.billing,
        isInTrial: updateSubscriptionDto.isInTrial,
        currentPeriodStart: updateSubscriptionDto.currentPeriodStart ? new Date(updateSubscriptionDto.currentPeriodStart) : undefined,
        currentPeriodEnd: updateSubscriptionDto.currentPeriodEnd ? new Date(updateSubscriptionDto.currentPeriodEnd) : undefined,
        nextBillingDate: updateSubscriptionDto.nextBillingDate ? new Date(updateSubscriptionDto.nextBillingDate) : undefined,
        lastPaymentDate: updateSubscriptionDto.lastPaymentDate ? new Date(updateSubscriptionDto.lastPaymentDate) : undefined,
        lastPaymentAmount: updateSubscriptionDto.lastPaymentAmount,
        failedPaymentCount: updateSubscriptionDto.failedPaymentCount,
        lastFailedPaymentDate: updateSubscriptionDto.lastFailedPaymentDate ? new Date(updateSubscriptionDto.lastFailedPaymentDate) : undefined,
        cancelAtPeriodEnd: updateSubscriptionDto.cancelAtPeriodEnd,
        canceledAt: updateSubscriptionDto.canceledAt ? new Date(updateSubscriptionDto.canceledAt) : undefined,
        cancellationReason: updateSubscriptionDto.cancellationReason,
        discountCode: updateSubscriptionDto.discountCode,
      },
      include: {
        plan: {
          select: { id: true, name: true, type: true, description: true },
        },
        company: {
          select: { id: true, name: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return updatedSubscription;
  }

  async cancel(id: string, cancelSubscriptionDto: CancelSubscriptionDto, companyId: string) {
    const subscription = await this.findOne(id, companyId);

    if (subscription.status === SubscriptionStatus.CANCELED) {
      throw new BadRequestException('Subscription is already canceled');
    }

    // Cancel with Stripe if applicable
    if (subscription.stripeSubscriptionId) {
      try {
        await this.stripeService.cancelSubscription(
          subscription.stripeSubscriptionId, 
          cancelSubscriptionDto.immediately || false
        );
      } catch (error) {
        console.error('Error canceling Stripe subscription:', error);
        throw new BadRequestException('Failed to cancel subscription with payment provider');
      }
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELED,
        cancelAtPeriodEnd: !cancelSubscriptionDto.immediately,
        canceledAt: new Date(),
        cancellationReason: cancelSubscriptionDto.reason,
        nextBillingDate: cancelSubscriptionDto.immediately ? null : subscription.nextBillingDate,
      },
      include: {
        plan: {
          select: { id: true, name: true, type: true, description: true },
        },
        company: {
          select: { id: true, name: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return updatedSubscription;
  }

  async reactivate(id: string, companyId: string) {
    const subscription = await this.findOne(id, companyId);

    if (subscription.status !== SubscriptionStatus.CANCELED) {
      throw new BadRequestException('Only canceled subscriptions can be reactivated');
    }

    // Reactivate with Stripe if applicable
    if (subscription.stripeSubscriptionId) {
      try {
        await this.stripeService.updateSubscription(subscription.stripeSubscriptionId, {
          metadata: {
            reactivated: 'true',
            reactivatedAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Error reactivating Stripe subscription:', error);
        throw new BadRequestException('Failed to reactivate subscription with payment provider');
      }
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        cancellationReason: null,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      include: {
        plan: {
          select: { id: true, name: true, type: true, description: true },
        },
        company: {
          select: { id: true, name: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return updatedSubscription;
  }

  async remove(id: string, companyId: string) {
    const subscription = await this.findOne(id, companyId);

    // Don't allow deletion of active subscriptions
    if (subscription.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete active subscriptions. Cancel first.');
    }

    return this.prisma.subscription.delete({
      where: { id },
    });
  }

  async getSubscriptionStats(companyId: string) {
    const [
      totalSubscriptions,
      activeSubscriptions,
      canceledSubscriptions,
      byStatus,
      byPlan,
      totalRevenue,
      averageRevenue,
      trialSubscriptions,
    ] = await Promise.all([
      this.prisma.subscription.count({ where: { companyId } }),
      this.prisma.subscription.count({ 
        where: { 
          companyId,
          status: SubscriptionStatus.ACTIVE,
        } 
      }),
      this.prisma.subscription.count({ 
        where: { 
          companyId,
          status: SubscriptionStatus.CANCELED,
        } 
      }),
      this.prisma.subscription.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { status: true },
      }),
      this.prisma.subscription.groupBy({
        by: ['planId'],
        where: { companyId },
        _count: { planId: true },
        _sum: { amount: true },
      }),
      this.prisma.subscription.aggregate({
        where: { 
          companyId,
          status: SubscriptionStatus.ACTIVE,
        },
        _sum: { amount: true },
      }),
      this.prisma.subscription.aggregate({
        where: { 
          companyId,
          status: SubscriptionStatus.ACTIVE,
        },
        _avg: { amount: true },
      }),
      this.prisma.subscription.count({
        where: {
          companyId,
          isInTrial: true,
        },
      }),
    ]);

    // Get plan names for byPlan stats
    const planIds = byPlan.map(item => item.planId);
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, name: true },
    });

    const byPlanWithNames = byPlan.map(item => {
      const plan = plans.find(p => p.id === item.planId);
      return {
        planId: item.planId,
        planName: plan?.name || 'Unknown',
        count: item._count.planId,
        totalAmount: item._sum.amount || 0,
      };
    });

    return {
      totalSubscriptions,
      activeSubscriptions,
      canceledSubscriptions,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      byPlan: byPlanWithNames,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageRevenue: averageRevenue._avg.amount || 0,
      trialSubscriptions,
    };
  }

  async checkPaymentStatus(companyId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        companyId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE],
        },
      },
      include: {
        plan: {
          select: { id: true, name: true },
        },
      },
    });

    const overdueSubscriptions = subscriptions.filter(sub => {
      if (!sub.nextBillingDate) return false;
      return new Date(sub.nextBillingDate) < new Date();
    });

    return {
      totalActiveSubscriptions: subscriptions.length,
      overdueSubscriptions: overdueSubscriptions.length,
      overdueDetails: overdueSubscriptions.map(sub => ({
        id: sub.id,
        planName: sub.plan.name,
        nextBillingDate: sub.nextBillingDate,
        amount: sub.amount,
        failedPaymentCount: sub.failedPaymentCount,
      })),
    };
  }
}
