import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';
import { FloatLabelModule } from 'primeng/floatlabel';

export type EstoqueInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'mask';
export type EstoqueInputSize = 'small' | 'normal' | 'large';

/**
 * Componente de input customizado para Estoque Mestre
 * 
 * Baseado no PrimeNG Input com customizações específicas do sistema
 * 
 * @example
 * ```html
 * <estoque-input 
 *   type="text"
 *   label="Nome do Produto"
 *   placeholder="Digite o nome do produto"
 *   [required]="true"
 *   [disabled]="isLoading"
 *   [(ngModel)]="productName">
 * </estoque-input>
 * ```
 */
@Component({
  selector: 'estoque-input',
  standalone: true,
  imports: [
    CommonModule, 
    InputTextModule, 
    InputTextarea, 
    InputNumberModule, 
    PasswordModule, 
    InputMaskModule,
    FloatLabelModule
  ],
  template: `
    <div class="estoque-input-wrapper" [class]="wrapperClass">
      <!-- Float Label -->
      <p-floatlabel *ngIf="floatLabel">
        <p-inputtext
          *ngIf="type === 'text' || type === 'email' || type === 'tel' || type === 'url' || type === 'search'"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [style]="style"
          [styleClass]="inputClass"
          [maxlength]="maxlength"
          [minlength]="minlength"
          [pattern]="pattern"
          [autocomplete]="autocomplete"
          [autofocus]="autofocus"
          [ariaLabel]="ariaLabel"
          [ariaRequired]="required"
          (onInput)="onInput.emit($event)"
          (onFocus)="onFocus.emit($event)"
          (onBlur)="onBlur.emit($event)"
          (onKeydown)="onKeydown.emit($event)"
          (onKeyup)="onKeyup.emit($event)"
          (onPaste)="onPaste.emit($event)"
          (onChange)="onChange.emit($event)"
          (onClear)="onClear.emit($event)" />
        
        <p-password
          *ngIf="type === 'password'"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [style]="style"
          [styleClass]="inputClass"
          [maxlength]="maxlength"
          [minlength]="minlength"
          [pattern]="pattern"
          [autocomplete]="autocomplete"
          [autofocus]="autofocus"
          [ariaLabel]="ariaLabel"
          [ariaRequired]="required"
          [feedback]="passwordFeedback"
          [toggleMask]="passwordToggleMask"
          [promptLabel]="passwordPromptLabel"
          [weakLabel]="passwordWeakLabel"
          [mediumLabel]="passwordMediumLabel"
          [strongLabel]="passwordStrongLabel"
          (onInput)="onInput.emit($event)"
          (onFocus)="onFocus.emit($event)"
          (onBlur)="onBlur.emit($event)"
          (onKeydown)="onKeydown.emit($event)"
          (onKeyup)="onKeyup.emit($event)"
          (onPaste)="onPaste.emit($event)"
          (onChange)="onChange.emit($event)" />
        
        <p-inputnumber
          *ngIf="type === 'number'"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [style]="style"
          [styleClass]="inputClass"
          [min]="min"
          [max]="max"
          [step]="step"
          [minFractionDigits]="minFractionDigits"
          [maxFractionDigits]="maxFractionDigits"
          [currency]="currency"
          [locale]="locale"
          [mode]="numberMode"
          [prefix]="prefix"
          [suffix]="suffix"
          [useGrouping]="useGrouping"
          [ariaLabel]="ariaLabel"
          [ariaRequired]="required"
          (onInput)="onInput.emit($event)"
          (onFocus)="onFocus.emit($event)"
          (onBlur)="onBlur.emit($event)"
          (onKeydown)="onKeydown.emit($event)"
          (onKeyup)="onKeyup.emit($event)"
          (onChange)="onChange.emit($event)" />
        
        <p-inputmask
          *ngIf="type === 'mask'"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [style]="style"
          [styleClass]="inputClass"
          [mask]="mask"
          [slotChar]="slotChar"
          [autoClear]="autoClear"
          [unmask]="unmask"
          [ariaLabel]="ariaLabel"
          [ariaRequired]="required"
          (onInput)="onInput.emit($event)"
          (onFocus)="onFocus.emit($event)"
          (onBlur)="onBlur.emit($event)"
          (onKeydown)="onKeydown.emit($event)"
          (onKeyup)="onKeyup.emit($event)"
          (onPaste)="onPaste.emit($event)"
          (onChange)="onChange.emit($event)"
          (onComplete)="onComplete.emit($event)" />
        
        <p-inputtextarea
          *ngIf="type === 'textarea'"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [style]="style"
          [styleClass]="inputClass"
          [rows]="rows"
          [cols]="cols"
          [maxlength]="maxlength"
          [minlength]="minlength"
          [pattern]="pattern"
          [autocomplete]="autocomplete"
          [autofocus]="autofocus"
          [ariaLabel]="ariaLabel"
          [ariaRequired]="required"
          (onInput)="onInput.emit($event)"
          (onFocus)="onFocus.emit($event)"
          (onBlur)="onBlur.emit($event)"
          (onKeydown)="onKeydown.emit($event)"
          (onKeyup)="onKeyup.emit($event)"
          (onPaste)="onPaste.emit($event)"
          (onChange)="onChange.emit($event)" />
        
        <label>{{ label }}</label>
      </p-floatlabel>
      
      <!-- Regular Input without Float Label -->
      <div *ngIf="!floatLabel" class="estoque-input-regular">
        <label *ngIf="label" class="estoque-input-label" [class.required]="required">
          {{ label }}
        </label>
        
        <p-inputtext
          *ngIf="type === 'text' || type === 'email' || type === 'tel' || type === 'url' || type === 'search'"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [style]="style"
          [styleClass]="inputClass"
          [maxlength]="maxlength"
          [minlength]="minlength"
          [pattern]="pattern"
          [autocomplete]="autocomplete"
          [autofocus]="autofocus"
          [ariaLabel]="ariaLabel"
          [ariaRequired]="required"
          (onInput)="onInput.emit($event)"
          (onFocus)="onFocus.emit($event)"
          (onBlur)="onBlur.emit($event)"
          (onKeydown)="onKeydown.emit($event)"
          (onKeyup)="onKeyup.emit($event)"
          (onPaste)="onPaste.emit($event)"
          (onChange)="onChange.emit($event)"
          (onClear)="onClear.emit($event)" />
        
        <!-- Other input types without float label... -->
      </div>
      
      <!-- Error Message -->
      <small *ngIf="errorMessage" class="estoque-input-error">
        {{ errorMessage }}
      </small>
      
      <!-- Help Text -->
      <small *ngIf="helpText && !errorMessage" class="estoque-input-help">
        {{ helpText }}
      </small>
    </div>
  `,
  styles: [`
    .estoque-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .estoque-input-label {
      font-weight: 500;
      color: var(--p-text-color);
      margin-bottom: 0.25rem;
    }
    
    .estoque-input-label.required::after {
      content: ' *';
      color: var(--p-red-500);
    }
    
    .estoque-input-error {
      color: var(--p-red-500);
      font-size: 0.875rem;
    }
    
    .estoque-input-help {
      color: var(--p-text-muted-color);
      font-size: 0.875rem;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EstoqueInputComponent),
      multi: true
    }
  ]
})
export class EstoqueInputComponent implements ControlValueAccessor {
  @Input() type: EstoqueInputType = 'text';
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() size: EstoqueInputSize = 'normal';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() floatLabel: boolean = false;
  @Input() errorMessage?: string;
  @Input() helpText?: string;
  @Input() style?: { [key: string]: any };
  @Input() styleClass?: string;
  @Input() wrapperClass?: string;
  @Input() inputClass?: string;
  @Input() maxlength?: number;
  @Input() minlength?: number;
  @Input() pattern?: string;
  @Input() autocomplete?: string;
  @Input() autofocus?: boolean;
  @Input() ariaLabel?: string;
  
  // Number input specific
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() minFractionDigits?: number;
  @Input() maxFractionDigits?: number;
  @Input() currency?: string;
  @Input() locale?: string;
  @Input() numberMode?: string;
  @Input() prefix?: string;
  @Input() suffix?: string;
  @Input() useGrouping?: boolean;
  
  // Textarea specific
  @Input() rows?: number;
  @Input() cols?: number;
  
  // Mask specific
  @Input() mask?: string;
  @Input() slotChar?: string;
  @Input() autoClear?: boolean;
  @Input() unmask?: boolean;
  
  // Password specific
  @Input() passwordFeedback: boolean = true;
  @Input() passwordToggleMask: boolean = true;
  @Input() passwordPromptLabel?: string;
  @Input() passwordWeakLabel?: string;
  @Input() passwordMediumLabel?: string;
  @Input() passwordStrongLabel?: string;

  @Output() onInput = new EventEmitter<any>();
  @Output() onFocus = new EventEmitter<any>();
  @Output() onBlur = new EventEmitter<any>();
  @Output() onKeydown = new EventEmitter<any>();
  @Output() onKeyup = new EventEmitter<any>();
  @Output() onPaste = new EventEmitter<any>();
  @Output() onChange = new EventEmitter<any>();
  @Output() onClear = new EventEmitter<any>();
  @Output() onComplete = new EventEmitter<any>();

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
