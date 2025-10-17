import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlanQueryDto } from './dto/subscription-plan-query.dto';
import { PlanStatus } from '@prisma/client';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async create(createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    // Check if slug already exists
    const existingPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: createSubscriptionPlanDto.slug },
    });

    if (existingPlan) {
      throw new ConflictException('Plan with this slug already exists');
    }

    // Create Stripe product and price if needed
    let stripeProductId: string | undefined;
    let stripePriceId: string | undefined;

    if (createSubscriptionPlanDto.stripeProductId) {
      stripeProductId = createSubscriptionPlanDto.stripeProductId;
    } else {
      try {
        const stripeProduct = await this.stripeService.createProduct({
          name: createSubscriptionPlanDto.name,
          description: createSubscriptionPlanDto.description,
          metadata: {
            planType: createSubscriptionPlanDto.type,
            slug: createSubscriptionPlanDto.slug,
          },
        });
        stripeProductId = stripeProduct.id;
      } catch (error) {
        console.error('Error creating Stripe product:', error);
        // Continue without Stripe integration
      }
    }

    if (createSubscriptionPlanDto.stripePriceId) {
      stripePriceId = createSubscriptionPlanDto.stripePriceId;
    } else if (stripeProductId) {
      try {
        const stripePrice = await this.stripeService.createPrice({
          productId: stripeProductId,
          unitAmount: createSubscriptionPlanDto.monthlyPrice,
          currency: createSubscriptionPlanDto.currency || 'BRL',
          recurring: {
            interval: 'month',
            intervalCount: 1,
          },
          metadata: {
            planType: createSubscriptionPlanDto.type,
            slug: createSubscriptionPlanDto.slug,
          },
        });
        stripePriceId = stripePrice.id;
      } catch (error) {
        console.error('Error creating Stripe price:', error);
        // Continue without Stripe integration
      }
    }

    // Create subscription plan
    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        name: createSubscriptionPlanDto.name,
        description: createSubscriptionPlanDto.description,
        slug: createSubscriptionPlanDto.slug,
        type: createSubscriptionPlanDto.type,
        status: createSubscriptionPlanDto.status || PlanStatus.ACTIVE,
        monthlyPrice: createSubscriptionPlanDto.monthlyPrice,
        yearlyPrice: createSubscriptionPlanDto.yearlyPrice,
        currency: createSubscriptionPlanDto.currency || 'BRL',
        features: createSubscriptionPlanDto.features || {},
        stripePriceId,
        stripeProductId,
        isPopular: createSubscriptionPlanDto.isPopular || false,
        isRecommended: createSubscriptionPlanDto.isRecommended || false,
        displayOrder: createSubscriptionPlanDto.displayOrder || 0,
        isPublic: createSubscriptionPlanDto.isPublic !== undefined ? createSubscriptionPlanDto.isPublic : true,
        availableFrom: createSubscriptionPlanDto.availableFrom ? new Date(createSubscriptionPlanDto.availableFrom) : undefined,
        availableUntil: createSubscriptionPlanDto.availableUntil ? new Date(createSubscriptionPlanDto.availableUntil) : undefined,
        trialDays: createSubscriptionPlanDto.trialDays || 0,
        isPromotional: createSubscriptionPlanDto.isPromotional || false,
        promotionalPrice: createSubscriptionPlanDto.promotionalPrice,
        promotionalStartDate: createSubscriptionPlanDto.promotionalStartDate ? new Date(createSubscriptionPlanDto.promotionalStartDate) : undefined,
        promotionalEndDate: createSubscriptionPlanDto.promotionalEndDate ? new Date(createSubscriptionPlanDto.promotionalEndDate) : undefined,
        promotionalDescription: createSubscriptionPlanDto.promotionalDescription,
        referralReward: createSubscriptionPlanDto.referralReward || 0,
        referralRewardType: createSubscriptionPlanDto.referralRewardType || 'fixed',
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return plan;
  }

  async findAll(query: SubscriptionPlanQueryDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    
    const where: any = {};
    
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.minPrice !== undefined) where.monthlyPrice = { ...where.monthlyPrice, gte: query.minPrice };
    if (query.maxPrice !== undefined) where.monthlyPrice = { ...where.monthlyPrice, lte: query.maxPrice };
    if (query.currency) where.currency = query.currency;
    if (query.isPopular !== undefined) where.isPopular = query.isPopular;
    if (query.isRecommended !== undefined) where.isRecommended = query.isRecommended;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;
    if (query.isPromotional !== undefined) where.isPromotional = query.isPromotional;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    
    const [plans, total] = await Promise.all([
      this.prisma.subscriptionPlan.findMany({
        where,
        skip,
        take: query.limit || 20,
        orderBy: {
          [query.sortBy || 'displayOrder']: query.sortOrder || 'asc',
        },
        include: {
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
      }),
      this.prisma.subscriptionPlan.count({ where }),
    ]);

    return {
      plans,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }

  async findOne(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID ${id} not found`);
    }

    return plan;
  }

  async findBySlug(slug: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Subscription plan with slug ${slug} not found`);
    }

    return plan;
  }

  async findPublic() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: {
        isPublic: true,
        status: PlanStatus.ACTIVE,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { monthlyPrice: 'asc' },
      ],
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return plans;
  }

  async update(id: string, updateSubscriptionPlanDto: UpdateSubscriptionPlanDto) {
    const plan = await this.findOne(id);

    // Check if slug is being updated and if it already exists
    if (updateSubscriptionPlanDto.slug && updateSubscriptionPlanDto.slug !== plan.slug) {
      const existingPlan = await this.prisma.subscriptionPlan.findUnique({
        where: { slug: updateSubscriptionPlanDto.slug },
      });

      if (existingPlan) {
        throw new ConflictException('Plan with this slug already exists');
      }
    }

    // Update Stripe product if name or description changed
    if (plan.stripeProductId && (updateSubscriptionPlanDto.name || updateSubscriptionPlanDto.description)) {
      try {
        await this.stripeService.updateCustomer(plan.stripeProductId, {
          name: updateSubscriptionPlanDto.name,
          metadata: {
            description: updateSubscriptionPlanDto.description || '',
          },
        });
      } catch (error) {
        console.error('Error updating Stripe product:', error);
        // Continue with database update even if Stripe update fails
      }
    }

    const updatedPlan = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: updateSubscriptionPlanDto.name,
        description: updateSubscriptionPlanDto.description,
        slug: updateSubscriptionPlanDto.slug,
        status: updateSubscriptionPlanDto.status,
        monthlyPrice: updateSubscriptionPlanDto.monthlyPrice,
        yearlyPrice: updateSubscriptionPlanDto.yearlyPrice,
        currency: updateSubscriptionPlanDto.currency,
        features: updateSubscriptionPlanDto.features,
        stripePriceId: updateSubscriptionPlanDto.stripePriceId,
        stripeProductId: updateSubscriptionPlanDto.stripeProductId,
        isPopular: updateSubscriptionPlanDto.isPopular,
        isRecommended: updateSubscriptionPlanDto.isRecommended,
        displayOrder: updateSubscriptionPlanDto.displayOrder,
        isPublic: updateSubscriptionPlanDto.isPublic,
        availableFrom: updateSubscriptionPlanDto.availableFrom ? new Date(updateSubscriptionPlanDto.availableFrom) : undefined,
        availableUntil: updateSubscriptionPlanDto.availableUntil ? new Date(updateSubscriptionPlanDto.availableUntil) : undefined,
        trialDays: updateSubscriptionPlanDto.trialDays,
        isPromotional: updateSubscriptionPlanDto.isPromotional,
        promotionalPrice: updateSubscriptionPlanDto.promotionalPrice,
        promotionalStartDate: updateSubscriptionPlanDto.promotionalStartDate ? new Date(updateSubscriptionPlanDto.promotionalStartDate) : undefined,
        promotionalEndDate: updateSubscriptionPlanDto.promotionalEndDate ? new Date(updateSubscriptionPlanDto.promotionalEndDate) : undefined,
        promotionalDescription: updateSubscriptionPlanDto.promotionalDescription,
        referralReward: updateSubscriptionPlanDto.referralReward,
        referralRewardType: updateSubscriptionPlanDto.referralRewardType,
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return updatedPlan;
  }

  async remove(id: string) {
    const plan = await this.findOne(id);

    // Check if plan has active subscriptions
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        planId: id,
        status: {
          in: ['ACTIVE', 'PAST_DUE'],
        },
      },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException('Cannot delete plan with active subscriptions');
    }

    return this.prisma.subscriptionPlan.delete({
      where: { id },
    });
  }

  async getPlanStats() {
    const [
      totalPlans,
      activePlans,
      publicPlans,
      byType,
      byStatus,
      totalSubscriptions,
      averagePrice,
    ] = await Promise.all([
      this.prisma.subscriptionPlan.count(),
      this.prisma.subscriptionPlan.count({ 
        where: { status: PlanStatus.ACTIVE } 
      }),
      this.prisma.subscriptionPlan.count({ 
        where: { 
          status: PlanStatus.ACTIVE,
          isPublic: true,
        } 
      }),
      this.prisma.subscriptionPlan.groupBy({
        by: ['type'],
        _count: { type: true },
        _avg: { monthlyPrice: true },
      }),
      this.prisma.subscriptionPlan.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.subscription.count(),
      this.prisma.subscriptionPlan.aggregate({
        _avg: { monthlyPrice: true },
      }),
    ]);

    return {
      totalPlans,
      activePlans,
      publicPlans,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = {
          count: item._count.type,
          averagePrice: item._avg.monthlyPrice || 0,
        };
        return acc;
      }, {}),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      totalSubscriptions,
      averagePrice: averagePrice._avg.monthlyPrice || 0,
    };
  }

  async getPopularPlans(limit: number = 3) {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: {
        isPopular: true,
        status: PlanStatus.ACTIVE,
        isPublic: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { monthlyPrice: 'asc' },
      ],
      take: limit,
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return plans;
  }

  async getRecommendedPlans(limit: number = 3) {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: {
        isRecommended: true,
        status: PlanStatus.ACTIVE,
        isPublic: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { monthlyPrice: 'asc' },
      ],
      take: limit,
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return plans;
  }
}
