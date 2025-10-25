import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

export type EstoqueToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface EstoqueToastMessage {
  id?: string;
  severity: EstoqueToastSeverity;
  summary: string;
  detail: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
  data?: any;
}

/**
 * Componente de toast customizado para Estoque Mestre
 * 
 * Baseado no PrimeNG Toast com customizações específicas do sistema
 * 
 * @example
 * ```html
 * <estoque-toast 
 *   [position]="'top-right'"
 *   [life]="5000"
 *   (onClose)="onToastClose($event)">
 * </estoque-toast>
 * ```
 */
@Component({
  selector: 'estoque-toast',
  standalone: true,
  imports: [CommonModule, ToastModule],
  template: `
    <p-toast
      [position]="position"
      [life]="life"
      [style]="style"
      [styleClass]="styleClass"
      [baseZIndex]="baseZIndex"
      [autoZIndex]="autoZIndex"
      (onClose)="onClose.emit($event)"
      (onShow)="onShow.emit($event)"
      (onHide)="onHide.emit($event)">
    </p-toast>
  `,
  // MessageService should be provided at app root to avoid circular deps
})
export class EstoqueToastComponent {
  @Input() position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center' = 'top-right';
  @Input() life: number = 5000;
  // Removed invalid p-toast inputs (sticky, closable, transform/transition options)
  @Input() style?: { [key: string]: any };
  @Input() styleClass?: string;
  @Input() baseZIndex: number = 11000;
  @Input() autoZIndex: boolean = true;
  // breakpoints not required for p-toast

  @Output() onClose = new EventEmitter<any>();
  @Output() onShow = new EventEmitter<any>();
  @Output() onHide = new EventEmitter<any>();

  constructor(private messageService: MessageService) {}

  /**
   * Mostra um toast de sucesso
   */
  showSuccess(summary: string, detail: string, life?: number, sticky?: boolean): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: life || this.life
    });
  }

  /**
   * Mostra um toast de erro
   */
  showError(summary: string, detail: string, life?: number, sticky?: boolean): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: life || this.life
    });
  }

  /**
   * Mostra um toast de aviso
   */
  showWarning(summary: string, detail: string, life?: number, sticky?: boolean): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: life || this.life
    });
  }

  /**
   * Mostra um toast de informação
   */
  showInfo(summary: string, detail: string, life?: number, sticky?: boolean): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: life || this.life
    });
  }

  /**
   * Mostra um toast customizado
   */
  show(message: EstoqueToastMessage): void {
    this.messageService.add({
      severity: message.severity,
      summary: message.summary,
      detail: message.detail,
      life: message.life || this.life,
      data: message.data
    });
  }

  /**
   * Limpa todos os toasts
   */
  clear(): void {
    this.messageService.clear();
  }
}
