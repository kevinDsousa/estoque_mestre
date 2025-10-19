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
      [sticky]="sticky"
      [closable]="closable"
      [showTransformOptions]="showTransformOptions"
      [hideTransformOptions]="hideTransformOptions"
      [showTransitionOptions]="showTransitionOptions"
      [hideTransitionOptions]="hideTransitionOptions"
      [style]="style"
      [styleClass]="styleClass"
      [baseZIndex]="baseZIndex"
      [autoZIndex]="autoZIndex"
      [breakpoints]="breakpoints"
      (onClose)="onClose.emit($event)"
      (onShow)="onShow.emit($event)"
      (onHide)="onHide.emit($event)">
    </p-toast>
  `,
  providers: [MessageService]
})
export class EstoqueToastComponent {
  @Input() position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center' = 'top-right';
  @Input() life: number = 5000;
  @Input() sticky: boolean = false;
  @Input() closable: boolean = true;
  @Input() showTransformOptions: string = 'translateY(100%)';
  @Input() hideTransformOptions: string = 'translateY(-100%)';
  @Input() showTransitionOptions: string = '300ms ease-out';
  @Input() hideTransitionOptions: string = '250ms ease-in';
  @Input() style?: { [key: string]: any };
  @Input() styleClass?: string;
  @Input() baseZIndex: number = 0;
  @Input() autoZIndex: boolean = true;
  @Input() breakpoints?: { [key: string]: any };

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
      life: life || this.life,
      sticky: sticky || this.sticky
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
      life: life || this.life,
      sticky: sticky || this.sticky
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
      life: life || this.life,
      sticky: sticky || this.sticky
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
      life: life || this.life,
      sticky: sticky || this.sticky
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
      sticky: message.sticky || this.sticky,
      closable: message.closable !== false,
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
