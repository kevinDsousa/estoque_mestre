import { Directive, ElementRef, HostListener, OnInit, AfterViewInit, Optional, Self } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[appPhoneMask]',
  standalone: true
})
export class PhoneMaskDirective implements OnInit, AfterViewInit {
  constructor(private el: ElementRef<HTMLInputElement>, @Optional() @Self() private ngModel?: NgModel) {}

  ngOnInit(): void {
    // Aplica máscara no valor inicial (quando o input já vem preenchido)
    this.applyMask(this.el.nativeElement.value);
  }

  ngAfterViewInit(): void {
    // Se o valor vier do ngModel, observa mudanças para aplicar a máscara imediatamente
    if (this.ngModel && this.ngModel.valueChanges) {
      this.ngModel.valueChanges.subscribe((val) => {
        this.applyMask(val as string);
      });
      // Aplica também ao valor atual do ngModel (caso já setado antes do init)
      const current = (this.ngModel.model as string) ?? this.el.nativeElement.value;
      this.applyMask(current);
    }
  }

  // Observado via ngModel.valueChanges em ngAfterViewInit

  @HostListener('input', ['$event'])
  onInput(): void {
    const input = this.el.nativeElement;
    this.applyMask(input.value);
  }

  @HostListener('blur')
  onBlur(): void {
    // Ensure final formatting on blur
    const input = this.el.nativeElement;
    this.applyMask(input.value);
  }

  private applyMask(raw: string): void {
    const input = this.el.nativeElement;
    const digits = (raw || '').replace(/\D/g, '');
    input.value = this.formatBrazilPhone(digits);
  }

  private formatBrazilPhone(digits: string): string {
    const len = digits.length;

    if (len === 0) return '';

    // Limit to 11 digits (BR phones)
    const val = digits.substring(0, 11);

    if (val.length <= 2) {
      return `(${val}`;
    }

    if (val.length <= 6) {
      // Partial landline formatting: (XX) XXXX
      return `(${val.substring(0, 2)}) ${val.substring(2)}`;
    }

    if (val.length === 10) {
      // Landline: (XX) XXXX-XXXX
      return `(${val.substring(0, 2)}) ${val.substring(2, 6)}-${val.substring(6, 10)}`;
    }

    // Mobile (11 digits): (XX) XXXXX-XXXX
    return `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7, 11)}`;
  }
}


