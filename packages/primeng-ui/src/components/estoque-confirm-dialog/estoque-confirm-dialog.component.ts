import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'info' | 'warn' | 'error' | 'success';
  icon?: string;
  showCancel?: boolean;
}

export interface EstoqueConfirmDialogInputs {
  visible: boolean;
  data: ConfirmDialogData;
  loading: boolean;
  disabled: boolean;
}

export interface EstoqueConfirmDialogOutputs {
  onConfirm: EventEmitter<void>;
  onCancel: EventEmitter<void>;
  onHide: EventEmitter<void>;
}

/**
 * Componente de modal de confirmação para Estoque Mestre
 * 
 * Modal padronizado para confirmações, exclusões e ações críticas
 * 
 * @example
 * ```html
 * <estoque-confirm-dialog 
 *   [visible]="showConfirmDialog"
 *   [data]="confirmData"
 *   [loading]="loading"
 *   (onConfirm)="onConfirm()"
 *   (onCancel)="onCancel()">
 * </estoque-confirm-dialog>
 * ```
 */
@Component({
  selector: 'estoque-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './estoque-confirm-dialog.component.html',
  styleUrls: ['./estoque-confirm-dialog.component.scss']
})
export class EstoqueConfirmDialogComponent implements EstoqueConfirmDialogInputs, EstoqueConfirmDialogOutputs {
  @Input() visible: boolean = false;
  @Input() data: ConfirmDialogData = {
    title: 'Confirmar Ação',
    message: 'Tem certeza que deseja continuar?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    severity: 'info',
    icon: 'pi pi-question-circle',
    showCancel: true
  };
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onHide = new EventEmitter<void>();

  onConfirmHandler(): void {
    this.onConfirm.emit();
  }

  onCancelHandler(): void {
    this.onCancel.emit();
  }

  onHideHandler(): void {
    this.onHide.emit();
  }

  getSeverityClass(): string {
    return `severity-${this.data.severity || 'info'}`;
  }

  getIconClass(): string {
    return this.data.icon || this.getDefaultIcon();
  }

  private getDefaultIcon(): string {
    switch (this.data.severity) {
      case 'error':
        return 'pi pi-exclamation-triangle';
      case 'warn':
        return 'pi pi-exclamation-circle';
      case 'success':
        return 'pi pi-check-circle';
      default:
        return 'pi pi-question-circle';
    }
  }

  getButtonSeverity(): 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' {
    switch (this.data.severity) {
      case 'error':
        return 'danger';
      case 'warn':
        return 'warn';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  }
}
