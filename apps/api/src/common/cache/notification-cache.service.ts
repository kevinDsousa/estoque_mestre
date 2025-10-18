import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

export interface CachedNotification {
  id: string;
  userId: string;
  companyId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationChannel {
  userId: string;
  companyId: string;
  lastSeen: Date;
  isActive: boolean;
}

@Injectable()
export class NotificationCacheService {
  private readonly notificationTtl: number;
  private readonly maxNotificationsPerUser: number = 100;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.notificationTtl = (this.configService.get<number>('redis.cache.notifications') || 1800) * 1000;
  }

  /**
   * Armazena uma notificação no cache
   */
  async cacheNotification(notification: CachedNotification): Promise<void> {
    const userKey = `notifications:user:${notification.userId}`;
    const companyKey = `notifications:company:${notification.companyId}`;
    const notificationKey = `notification:${notification.id}`;

    // Armazenar notificação individual
    await this.cacheManager.set(notificationKey, notification, this.notificationTtl);

    // Adicionar à lista do usuário
    const userNotifications = await this.getUserNotifications(notification.userId);
    userNotifications.unshift(notification);
    
    // Manter apenas as últimas N notificações
    if (userNotifications.length > this.maxNotificationsPerUser) {
      userNotifications.splice(this.maxNotificationsPerUser);
    }
    
    await this.cacheManager.set(userKey, userNotifications, this.notificationTtl);

    // Adicionar à lista da empresa
    const companyNotifications = await this.getCompanyNotifications(notification.companyId);
    companyNotifications.unshift(notification);
    
    if (companyNotifications.length > this.maxNotificationsPerUser) {
      companyNotifications.splice(this.maxNotificationsPerUser);
    }
    
    await this.cacheManager.set(companyKey, companyNotifications, this.notificationTtl);
  }

  /**
   * Obtém notificações de um usuário
   */
  async getUserNotifications(userId: string): Promise<CachedNotification[]> {
    const key = `notifications:user:${userId}`;
    const notifications = await this.cacheManager.get<CachedNotification[]>(key);
    return notifications || [];
  }

  /**
   * Obtém notificações de uma empresa
   */
  async getCompanyNotifications(companyId: string): Promise<CachedNotification[]> {
    const key = `notifications:company:${companyId}`;
    const notifications = await this.cacheManager.get<CachedNotification[]>(key);
    return notifications || [];
  }

  /**
   * Obtém notificações não lidas de um usuário
   */
  async getUnreadUserNotifications(userId: string): Promise<CachedNotification[]> {
    const notifications = await this.getUserNotifications(userId);
    return notifications.filter(n => !n.isRead);
  }

  /**
   * Marca uma notificação como lida
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    const notificationKey = `notification:${notificationId}`;
    const notification = await this.cacheManager.get<CachedNotification>(notificationKey);
    
    if (notification) {
      notification.isRead = true;
      await this.cacheManager.set(notificationKey, notification, this.notificationTtl);
      
      // Atualizar na lista do usuário
      const userNotifications = await this.getUserNotifications(userId);
      const index = userNotifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        userNotifications[index].isRead = true;
        await this.cacheManager.set(`notifications:user:${userId}`, userNotifications, this.notificationTtl);
      }
    }
  }

  /**
   * Marca todas as notificações de um usuário como lidas
   */
  async markAllUserNotificationsAsRead(userId: string): Promise<void> {
    const userNotifications = await this.getUserNotifications(userId);
    
    for (const notification of userNotifications) {
      if (!notification.isRead) {
        await this.markNotificationAsRead(notification.id, userId);
      }
    }
  }

  /**
   * Remove uma notificação do cache
   */
  async removeNotification(notificationId: string, userId: string, companyId: string): Promise<void> {
    const notificationKey = `notification:${notificationId}`;
    await this.cacheManager.del(notificationKey);
    
    // Remover da lista do usuário
    const userNotifications = await this.getUserNotifications(userId);
    const updatedUserNotifications = userNotifications.filter(n => n.id !== notificationId);
    await this.cacheManager.set(`notifications:user:${userId}`, updatedUserNotifications, this.notificationTtl);
    
    // Remover da lista da empresa
    const companyNotifications = await this.getCompanyNotifications(companyId);
    const updatedCompanyNotifications = companyNotifications.filter(n => n.id !== notificationId);
    await this.cacheManager.set(`notifications:company:${companyId}`, updatedCompanyNotifications, this.notificationTtl);
  }

  /**
   * Limpa notificações antigas de um usuário
   */
  async cleanOldUserNotifications(userId: string, daysOld: number = 30): Promise<void> {
    const userNotifications = await this.getUserNotifications(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const recentNotifications = userNotifications.filter(n => new Date(n.createdAt) > cutoffDate);
    await this.cacheManager.set(`notifications:user:${userId}`, recentNotifications, this.notificationTtl);
  }

  /**
   * Obtém contador de notificações não lidas
   */
  async getUnreadCount(userId: string): Promise<number> {
    const unreadNotifications = await this.getUnreadUserNotifications(userId);
    return unreadNotifications.length;
  }

  /**
   * Obtém contador de notificações por prioridade
   */
  async getNotificationCountByPriority(userId: string): Promise<Record<string, number>> {
    const notifications = await this.getUserNotifications(userId);
    const counts = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };
    
    for (const notification of notifications) {
      if (!notification.isRead) {
        counts[notification.priority]++;
      }
    }
    
    return counts;
  }

  /**
   * Armazena canal de notificação em tempo real
   */
  async setNotificationChannel(channel: NotificationChannel): Promise<void> {
    const key = `notification_channel:${channel.userId}`;
    await this.cacheManager.set(key, channel, this.notificationTtl);
  }

  /**
   * Obtém canal de notificação
   */
  async getNotificationChannel(userId: string): Promise<NotificationChannel | null> {
    const key = `notification_channel:${userId}`;
    return (await this.cacheManager.get<NotificationChannel>(key)) || null;
  }

  /**
   * Remove canal de notificação
   */
  async removeNotificationChannel(userId: string): Promise<void> {
    const key = `notification_channel:${userId}`;
    await this.cacheManager.del(key);
  }

  /**
   * Obtém usuários ativos para notificações de uma empresa
   */
  async getActiveUsersForCompany(companyId: string): Promise<string[]> {
    // Implementação simplificada
    // Em produção, você manteria uma lista de usuários ativos por empresa
    return [];
  }

  /**
   * Armazena preferências de notificação do usuário
   */
  async setUserNotificationPreferences(userId: string, preferences: any): Promise<void> {
    const key = `notification_preferences:${userId}`;
    await this.cacheManager.set(key, preferences, this.notificationTtl);
  }

  /**
   * Obtém preferências de notificação do usuário
   */
  async getUserNotificationPreferences(userId: string): Promise<any | null> {
    const key = `notification_preferences:${userId}`;
    return await this.cacheManager.get<any>(key);
  }

  /**
   * Obtém estatísticas de notificações
   */
  async getNotificationStats(companyId: string): Promise<{
    totalNotifications: number;
    unreadNotifications: number;
    notificationsByType: Record<string, number>;
    notificationsByPriority: Record<string, number>;
  }> {
    const notifications = await this.getCompanyNotifications(companyId);
    
    const stats = {
      totalNotifications: notifications.length,
      unreadNotifications: notifications.filter(n => !n.isRead).length,
      notificationsByType: {} as Record<string, number>,
      notificationsByPriority: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        URGENT: 0,
      },
    };
    
    for (const notification of notifications) {
      // Contar por tipo
      stats.notificationsByType[notification.type] = (stats.notificationsByType[notification.type] || 0) + 1;
      
      // Contar por prioridade
      stats.notificationsByPriority[notification.priority]++;
    }
    
    return stats;
  }

  /**
   * Limpa todas as notificações de um usuário
   */
  async clearUserNotifications(userId: string): Promise<void> {
    await this.cacheManager.del(`notifications:user:${userId}`);
    await this.cacheManager.del(`notification_channel:${userId}`);
    await this.cacheManager.del(`notification_preferences:${userId}`);
  }

  /**
   * Limpa todas as notificações de uma empresa
   */
  async clearCompanyNotifications(companyId: string): Promise<void> {
    await this.cacheManager.del(`notifications:company:${companyId}`);
  }
}
