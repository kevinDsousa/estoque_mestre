import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationPreferenceDto } from './dto/notification-preference.dto';
import { BulkNotificationDto } from './dto/bulk-notification.dto';
import { NotificationType, NotificationPriority, NotificationStatus, UserRole } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto, companyId: string, userId?: string) {
    const notification = await this.prisma.notification.create({
      data: {
        type: createNotificationDto.type,
        priority: createNotificationDto.priority || NotificationPriority.MEDIUM,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        entityId: createNotificationDto.entityId,
        entityType: createNotificationDto.entityType,
        metadata: createNotificationDto.data,
        companyId,
        userId: userId || '',
        status: NotificationStatus.UNREAD,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return notification;
  }

  async findAll(
    companyId: string,
    userId?: string,
    page: number = 1,
    limit: number = 20,
    type?: NotificationType,
    status?: NotificationStatus,
    priority?: NotificationPriority,
    isUrgent?: boolean,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = { companyId };
    
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (isUrgent !== undefined) where.isUrgent = isUrgent;
    
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          company: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string, userId?: string) {
    const where: any = { id, companyId };
    if (userId) where.userId = userId;

    const notification = await this.prisma.notification.findFirst({
      where,
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, companyId: string, userId?: string) {
    await this.findOne(id, companyId, userId); // Verify notification exists

    return this.prisma.notification.update({
      where: { id },
      data: {
        type: updateNotificationDto.type,
        priority: updateNotificationDto.priority,
        title: updateNotificationDto.title,
        message: updateNotificationDto.message,
        entityId: updateNotificationDto.entityId,
        entityType: updateNotificationDto.entityType,
        metadata: updateNotificationDto.data,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async markAsRead(id: string, companyId: string, userId?: string) {
    const notification = await this.findOne(id, companyId, userId);

    return this.prisma.notification.update({
      where: { id },
      data: { 
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async markAsArchived(id: string, companyId: string, userId?: string) {
    const notification = await this.findOne(id, companyId, userId);

    return this.prisma.notification.update({
      where: { id },
      data: { 
        status: NotificationStatus.ARCHIVED,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async markAllAsRead(companyId: string, userId?: string) {
    const where: any = { 
      companyId, 
      status: NotificationStatus.UNREAD,
    };
    if (userId) where.userId = userId;

    return this.prisma.notification.updateMany({
      where,
      data: { 
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }

  async remove(id: string, companyId: string, userId?: string) {
    const notification = await this.findOne(id, companyId, userId);

    return this.prisma.notification.update({
      where: { id },
      data: { 
        status: NotificationStatus.DELETED,
      },
    });
  }

  async sendBulkNotification(bulkNotificationDto: BulkNotificationDto, companyId: string, createdBy: string) {
    // Determine target users
    let targetUsers: any[] = [];

    if (bulkNotificationDto.userIds && bulkNotificationDto.userIds.length > 0) {
      // Specific users
      targetUsers = await this.prisma.user.findMany({
        where: {
          id: { in: bulkNotificationDto.userIds },
          companyId,
          status: 'ACTIVE',
        },
        select: { id: true },
      });
    } else if (bulkNotificationDto.userRoles && bulkNotificationDto.userRoles.length > 0) {
      // Users by role
      targetUsers = await this.prisma.user.findMany({
        where: {
          role: { in: bulkNotificationDto.userRoles as UserRole[] },
          companyId,
          status: 'ACTIVE',
        },
        select: { id: true },
      });
    } else {
      // All active users in company
      targetUsers = await this.prisma.user.findMany({
        where: {
          companyId,
          status: 'ACTIVE',
        },
        select: { id: true },
      });
    }

    if (targetUsers.length === 0) {
      throw new BadRequestException('No target users found');
    }

    // Create notifications for each user
    const notifications = await Promise.all(
      targetUsers.map(user =>
        this.prisma.notification.create({
          data: {
            type: bulkNotificationDto.type,
            priority: bulkNotificationDto.priority || NotificationPriority.MEDIUM,
            title: bulkNotificationDto.title,
            message: bulkNotificationDto.message,
            metadata: bulkNotificationDto.data,
            companyId,
            userId: user.id,
            status: NotificationStatus.UNREAD,
          },
        })
      )
    );

    return {
      sent: notifications.length,
      notifications: notifications.slice(0, 10), // Return first 10 for preview
    };
  }

  async getNotificationStats(companyId: string, userId?: string) {
    const where: any = { companyId };
    if (userId) where.userId = userId;

    const [
      total,
      unread,
      urgent,
      byType,
      byPriority,
    ] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { ...where, status: NotificationStatus.UNREAD } }),
      this.prisma.notification.count({ where: { ...where, isUrgent: true } }),
      this.prisma.notification.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      this.prisma.notification.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true },
      }),
    ]);

    return {
      total,
      unread,
      urgent,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {}),
    };
  }

  async getUnreadCount(companyId: string, userId?: string) {
    const where: any = { 
      companyId, 
      status: NotificationStatus.UNREAD,
    };
    if (userId) where.userId = userId;

    return this.prisma.notification.count({ where });
  }

  // System notification methods for automated alerts
  async createLowStockAlert(productId: string, companyId: string, currentStock: number, minStock: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { company: true },
    });

    if (!product) return;

    const title = 'Estoque Baixo';
    const message = `O produto "${product.name}" está com estoque baixo. Atual: ${currentStock}, Mínimo: ${minStock}`;

    return this.create({
      type: NotificationType.LOW_STOCK,
      priority: NotificationPriority.HIGH,
      title,
      message,
      entityId: productId,
      entityType: 'product',
      data: { currentStock, minStock, productName: product.name },
      actionUrl: `/products/${productId}`,
      actionText: 'Ver Produto',
      isUrgent: true,
    }, companyId);
  }

  async createOutOfStockAlert(productId: string, companyId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { company: true },
    });

    if (!product) return;

    const title = 'Produto Sem Estoque';
    const message = `O produto "${product.name}" está sem estoque!`;

    return this.create({
      type: NotificationType.OUT_OF_STOCK,
      priority: NotificationPriority.URGENT,
      title,
      message,
      entityId: productId,
      entityType: 'product',
      data: { productName: product.name },
      actionUrl: `/products/${productId}`,
      actionText: 'Ver Produto',
      isUrgent: true,
    }, companyId);
  }

  async createExpirationWarningAlert(productId: string, companyId: string, expirationDate: Date, daysUntilExpiration: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { company: true },
    });

    if (!product) return;

    const title = 'Produto Próximo do Vencimento';
    const message = `O produto "${product.name}" vence em ${daysUntilExpiration} dias (${expirationDate.toLocaleDateString()})`;

    return this.create({
      type: NotificationType.EXPIRATION_WARNING,
      priority: NotificationPriority.HIGH,
      title,
      message,
      entityId: productId,
      entityType: 'product',
      data: { expirationDate, daysUntilExpiration, productName: product.name },
      actionUrl: `/products/${productId}`,
      actionText: 'Ver Produto',
      isUrgent: daysUntilExpiration <= 3,
    }, companyId);
  }

  async createExpiredProductAlert(productId: string, companyId: string, expirationDate: Date) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { company: true },
    });

    if (!product) return;

    const title = 'Produto Vencido';
    const message = `O produto "${product.name}" está vencido desde ${expirationDate.toLocaleDateString()}`;

    return this.create({
      type: NotificationType.EXPIRED_PRODUCT,
      priority: NotificationPriority.URGENT,
      title,
      message,
      entityId: productId,
      entityType: 'product',
      data: { expirationDate, productName: product.name },
      actionUrl: `/products/${productId}`,
      actionText: 'Ver Produto',
      isUrgent: true,
    }, companyId);
  }

  async createOverduePaymentAlert(transactionId: string, companyId: string, customerName: string, amount: number, daysOverdue: number) {
    const title = 'Pagamento em Atraso';
    const message = `Pagamento em atraso de ${daysOverdue} dias para ${customerName}. Valor: R$ ${amount.toFixed(2)}`;

    return this.create({
      type: NotificationType.OVERDUE_PAYMENT,
      priority: NotificationPriority.HIGH,
      title,
      message,
      entityId: transactionId,
      entityType: 'transaction',
      data: { customerName, amount, daysOverdue },
      actionUrl: `/transactions/${transactionId}`,
      actionText: 'Ver Transação',
      isUrgent: daysOverdue > 30,
    }, companyId);
  }
}
