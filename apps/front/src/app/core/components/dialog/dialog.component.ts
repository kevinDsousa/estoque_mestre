import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DialogConfig } from '../../services/dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent implements OnInit, OnDestroy {
  dialogConfig: DialogConfig | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    this.subscription = this.dialogService.getDialogConfig().subscribe(config => {
      this.dialogConfig = config;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onConfirm(): void {
    this.dialogService.confirmAction(this.dialogConfig?.data);
  }

  onCancel(): void {
    this.dialogService.cancelAction();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  getDialogTypeClass(): string {
    if (!this.dialogConfig) return '';
    return `dialog-${this.dialogConfig.type || 'confirm'}`;
  }

  getIconClass(): string {
    if (!this.dialogConfig) return '';
    return this.dialogConfig.icon || 'pi pi-question-circle';
  }

  getIconColor(): string {
    if (!this.dialogConfig) return '';
    
    switch (this.dialogConfig.type) {
      case 'warning':
        return 'var(--color-warning)';
      case 'error':
        return 'var(--color-error)';
      case 'info':
        return 'var(--color-info)';
      default:
        return 'var(--color-primary)';
    }
  }
}
