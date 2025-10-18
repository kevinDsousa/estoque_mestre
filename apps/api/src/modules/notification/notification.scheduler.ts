import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType, NotificationPriority } from '@prisma/client';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkLowStock() {
    const products = await this.prisma.product.findMany({
      where: { currentStock: { lte: 0 } },
      select: { id: true, name: true, companyId: true },
      take: 100,
    });
    for (const p of products) {
      const users = await this.prisma.user.findMany({
        where: { companyId: p.companyId, status: 'ACTIVE' },
        select: { id: true },
      });
      for (const u of users) {
        await this.prisma.notification.create({
          data: {
            type: NotificationType.LOW_STOCK as any,
            priority: NotificationPriority.HIGH,
            title: 'Produto com estoque baixo',
            message: `O produto ${p.name} está com estoque baixo ou zerado`,
            userId: u.id,
            companyId: p.companyId,
            entityId: p.id,
            entityType: 'Product',
          },
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async checkExpiringProducts() {
    const soon = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    const batches = await this.prisma.productBatch.findMany({
      where: { expiryDate: { lte: soon, gte: new Date() } },
      select: { id: true, batchNumber: true, productId: true, companyId: true, expiryDate: true, product: { select: { name: true } } },
      take: 200,
    });
    for (const b of batches) {
      const users = await this.prisma.user.findMany({
        where: { companyId: b.companyId, status: 'ACTIVE' },
        select: { id: true },
      });
      for (const u of users) {
        await this.prisma.notification.create({
          data: {
            type: NotificationType.EXPIRATION_WARNING as any,
            priority: NotificationPriority.MEDIUM,
            title: 'Lote próximo do vencimento',
            message: `O lote ${b.batchNumber} do produto ${b.product.name} vence em breve (${b.expiryDate?.toISOString().slice(0,10)}).`,
            userId: u.id,
            companyId: b.companyId,
            entityId: b.id,
            entityType: 'ProductBatch',
          },
        });
      }
    }
  }
}


