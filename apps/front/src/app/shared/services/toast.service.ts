import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<ToastMessage[]>([]);
  private activeToasts = new Set<string>(); // Para evitar duplicatas

  getToasts() {
    return this.toasts.asReadonly();
  }

  show(message: Omit<ToastMessage, 'id' | 'timestamp'>) {
    // Cria uma chave única baseada no tipo, título e mensagem
    const toastKey = `${message.type}-${message.title}-${message.message}`;
    
    // Verifica se já existe um toast ativo com a mesma chave
    if (this.activeToasts.has(toastKey)) {
      console.warn('Toast duplicado ignorado:', toastKey);
      return;
    }

    const toast: ToastMessage = {
      ...message,
      id: this.generateId(),
      timestamp: Date.now()
    };

    // Adiciona à lista de toasts ativos
    this.activeToasts.add(toastKey);
    
    // Adiciona o toast
    this.toasts.update(current => [...current, toast]);

    // Remove automaticamente após a duração especificada
    const duration = message.duration || 5000;
    setTimeout(() => {
      this.remove(toast.id);
      this.activeToasts.delete(toastKey);
    }, duration);
  }

  success(title: string, message: string, duration?: number) {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number) {
    this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number) {
    this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number) {
    this.show({ type: 'info', title, message, duration });
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(toast => toast.id !== id));
  }

  clear() {
    this.toasts.set([]);
    this.activeToasts.clear();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
