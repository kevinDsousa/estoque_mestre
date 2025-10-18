import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  @Input() toast!: ToastMessage;
  @Output() close = new EventEmitter<string>();

  onClose() {
    this.close.emit(this.toast.id);
  }

  getIconClass(): string {
    switch (this.toast.type) {
      case 'success':
        return 'icon-success';
      case 'error':
        return 'icon-error';
      case 'warning':
        return 'icon-warning';
      case 'info':
        return 'icon-info';
      default:
        return 'icon-info';
    }
  }

  getToastClass(): string {
    return `toast toast-${this.toast.type}`;
  }
}
