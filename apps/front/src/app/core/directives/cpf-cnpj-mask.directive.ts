import { Directive, ElementRef, HostListener, OnInit, AfterViewInit, Optional, Self } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[appCpfCnpjMask]',
  standalone: true
})
export class CpfCnpjMaskDirective implements OnInit, AfterViewInit {
  constructor(private el: ElementRef<HTMLInputElement>, @Optional() @Self() private ngModel?: NgModel) {}

  ngOnInit(): void {
    this.applyMask(this.el.nativeElement.value);
  }

  ngAfterViewInit(): void {
    if (this.ngModel && this.ngModel.valueChanges) {
      this.ngModel.valueChanges.subscribe((val) => {
        this.applyMask(val as string);
      });
      const current = (this.ngModel.model as string) ?? this.el.nativeElement.value;
      this.applyMask(current);
    }
  }

  // Observado via ngModel.valueChanges em ngAfterViewInit

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    this.applyMask(input.value);
  }

  @HostListener('blur')
  onBlur(): void {
    const input = this.el.nativeElement;
    this.applyMask(input.value);
  }

  private applyMask(raw: string): void {
    const input = this.el.nativeElement;
    const digits = (raw || '').replace(/\D/g, '').slice(0, 14);
    input.value = this.formatCpfCnpj(digits);
  }

  private formatCpfCnpj(v: string): string {
    if (v.length <= 11) {
      // CPF: 000.000.000-00 (partial friendly)
      if (v.length <= 3) return v;
      if (v.length <= 6) return `${v.slice(0,3)}.${v.slice(3)}`;
      if (v.length <= 9) return `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6)}`;
      return `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6,9)}-${v.slice(9,11)}`;
    }

    // CNPJ: 00.000.000/0000-00 (partial friendly)
    if (v.length <= 2) return v;
    if (v.length <= 5) return `${v.slice(0,2)}.${v.slice(2)}`;
    if (v.length <= 8) return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5)}`;
    if (v.length <= 12) return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8)}`;
    return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8,12)}-${v.slice(12,14)}`;
  }
}


