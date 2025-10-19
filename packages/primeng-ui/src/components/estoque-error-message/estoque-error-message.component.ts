import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

export type ErrorSeverity = 'error' | 'warn' | 'info' | 'success';
export type ErrorSize = 'small' | 'medium' | 'large';

export interface ErrorMessageData {
  title?: string;
  message: string;
  details?: string;
  code?: string;
  timestamp?: Date;
  source?: string;
  component?: string;
  severity: ErrorSeverity;
  showDetails?: boolean;
  showTimestamp?: boolean;
  showSource?: boolean;
  actions?: ErrorAction[];
}

export interface ErrorAction {
  label: string;
  icon?: string;
  action: () => void;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger';
}

export interface EstoqueErrorMessageInputs {
  error: ErrorMessageData;
  size: ErrorSize;
  closable: boolean;
  dismissible: boolean;
  showIcon: boolean;
  inline: boolean;
}

export interface EstoqueErrorMessageOutputs {
  onClose: EventEmitter<void>;
  onAction: EventEmitter<ErrorAction>;
}

/**
 * Componente de mensagem de erro para Estoque Mestre
 * 
 * Componente padronizado para exibir mensagens de erro, warnings e informações
 * 
 * @example
 * ```html
 * <estoque-error-message 
 *   [error]="errorData"
 *   [closable]="true"
 *   [showIcon]="true"
 *   (onClose)="onErrorClose()">
 * </estoque-error-message>
 * ```
 */
@Component({
  selector: 'estoque-error-message',
  standalone: true,
  imports: [
    CommonModule,
    MessageModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './estoque-error-message.component.html',
  styleUrls: ['./estoque-error-message.component.scss']
})
export class EstoqueErrorMessageComponent implements EstoqueErrorMessageInputs, EstoqueErrorMessageOutputs {
  @Input() error: ErrorMessageData = {
    message: 'Erro desconhecido',
    severity: 'error'
  };
  @Input() size: ErrorSize = 'medium';
  @Input() closable: boolean = false;
  @Input() dismissible: boolean = true;
  @Input() showIcon: boolean = true;
  @Input() inline: boolean = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onAction = new EventEmitter<ErrorAction>();

  showDetails: boolean = false;

  onCloseHandler(): void {
    this.onClose.emit();
  }

  onActionHandler(action: ErrorAction): void {
    this.onAction.emit(action);
    action.action();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  getMessageClass(): string {
    const classes = ['estoque-error-message'];
    
    classes.push(`severity-${this.error.severity}`);
    classes.push(`size-${this.size}`);
    
    if (this.inline) classes.push('inline');
    if (this.showDetails) classes.push('expanded');
    
    return classes.join(' ');
  }

  getSeverityIcon(): string {
    switch (this.error.severity) {
      case 'error':
        return 'pi pi-exclamation-triangle';
      case 'warn':
        return 'pi pi-exclamation-circle';
      case 'info':
        return 'pi pi-info-circle';
      case 'success':
        return 'pi pi-check-circle';
      default:
        return 'pi pi-question-circle';
    }
  }

  getSeverityColor(): string {
    switch (this.error.severity) {
      case 'error':
        return 'var(--p-red-500)';
      case 'warn':
        return 'var(--p-orange-500)';
      case 'info':
        return 'var(--p-blue-500)';
      case 'success':
        return 'var(--p-green-500)';
      default:
        return 'var(--p-text-color-secondary)';
    }
  }

  formatTimestamp(): string {
    if (!this.error.timestamp) return '';
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(this.error.timestamp);
  }

  hasDetails(): boolean {
    return !!(this.error.details || this.error.code || this.error.source || this.error.component);
  }
}

