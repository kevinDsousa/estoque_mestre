import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="shouldShow" class="form-error">
      <span class="error-text">{{ firstMessage }}</span>
    </div>
  `,
  styles: [`
    .form-error { margin-top: 4px; }
    .error-text { color: var(--color-error, #ef4444); font-size: 12px; }
  `]
})
export class FormErrorComponent {
  @Input() control?: NgModel | null;
  @Input() messages?: Record<string, string>;

  get shouldShow(): boolean {
    return !!this.control && !!this.control.invalid && !!(this.control.touched || this.control.dirty);
  }

  get firstMessage(): string {
    if (!this.control || !this.control.errors) return '';
    const errors = this.control.errors as Record<string, any>;
    const key = Object.keys(errors)[0];
    const defaults: Record<string, string> = {
      required: 'Campo obrigatório.',
      email: 'Informe um e-mail válido.',
      minlength: 'Valor muito curto.',
      maxlength: 'Valor muito longo.',
      cpfInvalid: 'CPF inválido.',
      cnpjInvalid: 'CNPJ inválido.',
      cpfCnpjLengthInvalid: 'Informe um CPF (11) ou CNPJ (14) válido.'
    };
    return (this.messages && this.messages[key]) || defaults[key] || 'Valor inválido.';
  }
}


