import { Injectable, ComponentRef, ViewContainerRef, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DialogConfig {
  title: string;
  message: string;
  type?: 'confirm' | 'warning' | 'error' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  icon?: string;
  data?: any;
}

export interface DialogResult {
  confirmed: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogSubject = new BehaviorSubject<DialogConfig | null>(null);
  private resultSubject = new BehaviorSubject<DialogResult | null>(null);

  constructor() {}

  /**
   * Show confirmation dialog
   */
  confirm(config: DialogConfig): Observable<DialogResult> {
    this.dialogSubject.next({
      type: 'confirm',
      showCancel: true,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      icon: 'pi pi-question-circle',
      ...config
    });

    return new Observable(observer => {
      const subscription = this.resultSubject.subscribe(result => {
        if (result !== null) {
          observer.next(result);
          observer.complete();
          subscription.unsubscribe();
          this.clearDialog();
        }
      });
    });
  }

  /**
   * Show warning dialog
   */
  warning(config: DialogConfig): Observable<DialogResult> {
    this.dialogSubject.next({
      type: 'warning',
      showCancel: true,
      confirmText: 'Sim, continuar',
      cancelText: 'Cancelar',
      icon: 'pi pi-exclamation-triangle',
      ...config
    });

    return new Observable(observer => {
      const subscription = this.resultSubject.subscribe(result => {
        if (result !== null) {
          observer.next(result);
          observer.complete();
          subscription.unsubscribe();
          this.clearDialog();
        }
      });
    });
  }

  /**
   * Show error dialog
   */
  error(config: DialogConfig): Observable<DialogResult> {
    this.dialogSubject.next({
      type: 'error',
      showCancel: false,
      confirmText: 'OK',
      icon: 'pi pi-times-circle',
      ...config
    });

    return new Observable(observer => {
      const subscription = this.resultSubject.subscribe(result => {
        if (result !== null) {
          observer.next(result);
          observer.complete();
          subscription.unsubscribe();
          this.clearDialog();
        }
      });
    });
  }

  /**
   * Show info dialog
   */
  info(config: DialogConfig): Observable<DialogResult> {
    this.dialogSubject.next({
      type: 'info',
      showCancel: false,
      confirmText: 'OK',
      icon: 'pi pi-info-circle',
      ...config
    });

    return new Observable(observer => {
      const subscription = this.resultSubject.subscribe(result => {
        if (result !== null) {
          observer.next(result);
          observer.complete();
          subscription.unsubscribe();
          this.clearDialog();
        }
      });
    });
  }

  /**
   * Show delete confirmation dialog
   */
  confirmDelete(itemName: string, itemType: string = 'item'): Observable<DialogResult> {
    return this.warning({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir ${itemType} "${itemName}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      icon: 'pi pi-trash',
      data: { itemName, itemType }
    });
  }

  /**
   * Get current dialog config
   */
  getDialogConfig(): Observable<DialogConfig | null> {
    return this.dialogSubject.asObservable();
  }

  /**
   * Confirm dialog action
   */
  confirmAction(data?: any): void {
    this.resultSubject.next({ confirmed: true, data });
  }

  /**
   * Cancel dialog action
   */
  cancelAction(): void {
    this.resultSubject.next({ confirmed: false });
  }

  /**
   * Clear current dialog
   */
  private clearDialog(): void {
    this.dialogSubject.next(null);
    this.resultSubject.next(null);
  }

  /**
   * Check if dialog is open
   */
  isDialogOpen(): boolean {
    return this.dialogSubject.value !== null;
  }

  /**
   * Show success message
   */
  showSuccess(message: string, title: string = 'Sucesso'): void {
    this.info({
      title,
      message,
      icon: 'pi pi-check-circle',
      type: 'info'
    });
  }

  /**
   * Show error message
   */
  showError(message: string, title: string = 'Erro'): void {
    this.error({
      title,
      message,
      icon: 'pi pi-times-circle',
      type: 'error'
    });
  }

  /**
   * Show confirmation dialog (alias for confirm)
   */
  showConfirm(message: string, title: string = 'Confirmar'): Observable<DialogResult> {
    return this.confirm({
      title,
      message,
      icon: 'pi pi-question-circle',
      type: 'confirm'
    });
  }
}
