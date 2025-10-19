import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
  timestamp: Date;
  read: boolean;
}

export interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private readonly defaultDuration = 5000; // 5 seconds

  constructor() {}

  /**
   * Show success notification
   */
  success(title: string, message: string, options?: NotificationOptions): string {
    return this.addNotification({
      type: 'success',
      title,
      message,
      duration: options?.duration || this.defaultDuration,
      action: options?.action
    });
  }

  /**
   * Show error notification
   */
  error(title: string, message: string, options?: NotificationOptions): string {
    return this.addNotification({
      type: 'error',
      title,
      message,
      duration: options?.duration || this.defaultDuration,
      action: options?.action
    });
  }

  /**
   * Show warning notification
   */
  warning(title: string, message: string, options?: NotificationOptions): string {
    return this.addNotification({
      type: 'warning',
      title,
      message,
      duration: options?.duration || this.defaultDuration,
      action: options?.action
    });
  }

  /**
   * Show info notification
   */
  info(title: string, message: string, options?: NotificationOptions): string {
    return this.addNotification({
      type: 'info',
      title,
      message,
      duration: options?.duration || this.defaultDuration,
      action: options?.action
    });
  }

  /**
   * Add notification
   */
  private addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    // Auto remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, notification.duration);
    }

    return id;
  }

  /**
   * Remove notification
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Clear notifications by type
   */
  clearByType(type: Notification['type']): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.type !== type);
    this.notificationsSubject.next(filteredNotifications);
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notificationsSubject.value.filter(n => n.type === type);
  }

  /**
   * Get recent notifications (last 24 hours)
   */
  getRecentNotifications(): Notification[] {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.notificationsSubject.value.filter(n => n.timestamp > oneDayAgo);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * Handle API errors
   */
  handleApiError(error: any, context?: string): void {
    let title = 'Erro';
    let message = 'Ocorreu um erro inesperado';

    if (error?.message) {
      message = error.message;
    }

    if (context) {
      title = `Erro em ${context}`;
    }

    if (error?.status) {
      switch (error.status) {
        case 400:
          title = 'Dados inválidos';
          break;
        case 401:
          title = 'Não autorizado';
          message = 'Sua sessão expirou. Faça login novamente.';
          break;
        case 403:
          title = 'Acesso negado';
          message = 'Você não tem permissão para realizar esta ação.';
          break;
        case 404:
          title = 'Não encontrado';
          message = 'O recurso solicitado não foi encontrado.';
          break;
        case 409:
          title = 'Conflito';
          message = 'Já existe um registro com estes dados.';
          break;
        case 422:
          title = 'Dados inválidos';
          message = 'Verifique os dados informados e tente novamente.';
          break;
        case 429:
          title = 'Muitas tentativas';
          message = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
        case 500:
          title = 'Erro do servidor';
          message = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
      }
    }

    this.error(title, message);
  }

  /**
   * Handle success operations
   */
  handleSuccess(message: string, context?: string): void {
    const title = context ? `Sucesso em ${context}` : 'Sucesso';
    this.success(title, message);
  }

  /**
   * Handle warning operations
   */
  handleWarning(message: string, context?: string): void {
    const title = context ? `Atenção em ${context}` : 'Atenção';
    this.warning(title, message);
  }

  /**
   * Handle info operations
   */
  handleInfo(message: string, context?: string): void {
    const title = context ? `Informação em ${context}` : 'Informação';
    this.info(title, message);
  }
}
