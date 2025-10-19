import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

export type EstoqueButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outlined' | 'text';
export type EstoqueButtonSize = 'small' | 'normal' | 'large';
export type EstoqueButtonIconPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * Componente de botão customizado para Estoque Mestre
 * 
 * Baseado no PrimeNG Button com customizações específicas do sistema
 * 
 * @example
 * ```html
 * <estoque-button 
 *   variant="primary" 
 *   size="large" 
 *   icon="pi pi-plus"
 *   [loading]="isLoading"
 *   (click)="onClick()">
 *   Adicionar Produto
 * </estoque-button>
 * ```
 */
@Component({
  selector: 'estoque-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule],
  template: `
    <p-button
      [label]="label"
      [icon]="icon"
      [iconPos]="iconPosition"
      [size]="size"
      [severity]="severity"
      [outlined]="variant === 'outlined'"
      [text]="variant === 'text'"
      [loading]="loading"
      [disabled]="disabled"
      [loadingIcon]="loadingIcon"
      [badge]="badge"
      [badgeClass]="badgeClass"
      [style]="style"
      [styleClass]="styleClass"
      [ariaLabel]="ariaLabel"
      [tooltip]="tooltip"
      [tooltipOptions]="tooltipOptions"
      (onClick)="onClick.emit($event)"
      (onFocus)="onFocus.emit($event)"
      (onBlur)="onBlur.emit($event)"
      pRipple>
      <ng-content></ng-content>
    </p-button>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EstoqueButtonComponent),
      multi: true
    }
  ]
})
export class EstoqueButtonComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() icon?: string;
  @Input() iconPosition: EstoqueButtonIconPosition = 'left';
  @Input() variant: EstoqueButtonVariant = 'primary';
  @Input() size: EstoqueButtonSize = 'normal';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() loadingIcon: string = 'pi pi-spinner pi-spin';
  @Input() badge?: string;
  @Input() badgeClass?: string;
  @Input() style?: { [key: string]: any };
  @Input() styleClass?: string;
  @Input() ariaLabel?: string;
  @Input() tooltip?: string;
  @Input() tooltipOptions?: any;

  @Output() onClick = new EventEmitter<any>();
  @Output() onFocus = new EventEmitter<any>();
  @Output() onBlur = new EventEmitter<any>();

  // ControlValueAccessor implementation
  private _value: any;
  private _onChange = (value: any) => {};
  private _onTouched = () => {};

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this._value = value;
    this._onChange(value);
  }

  get severity(): string {
    switch (this.variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'success':
        return 'success';
      case 'warning':
        return 'warn';
      case 'error':
        return 'danger';
      case 'info':
        return 'info';
      default:
        return 'primary';
    }
  }

  writeValue(value: any): void {
    this._value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
