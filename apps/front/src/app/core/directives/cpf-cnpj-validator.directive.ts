import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appCpfCnpjValidator][ngModel],[appCpfCnpjValidator][formControlName]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: CpfCnpjValidatorDirective, multi: true }]
})
export class CpfCnpjValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').toString().replace(/\D/g, '');
    if (!value) return null;

    if (value.length === 11) {
      return this.isValidCpf(value) ? null : { cpfInvalid: true };
    }
    if (value.length === 14) {
      return this.isValidCnpj(value) ? null : { cnpjInvalid: true };
    }

    return { cpfCnpjLengthInvalid: true };
  }

  private isValidCpf(cpf: string): boolean {
    if (!cpf || cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    return rev === parseInt(cpf.charAt(10));
  }

  private isValidCnpj(cnpj: string): boolean {
    if (!cnpj || cnpj.length !== 14 || /^([0-9])\1+$/.test(cnpj)) return false;
    const calc = (x: number) => {
      let n = 0;
      let pos = x - 7;
      for (let i = 0; i < x; i++) {
        n += parseInt(cnpj.charAt(i)) * pos--;
        if (pos < 2) pos = 9;
      }
      const r = n % 11;
      return r < 2 ? 0 : 11 - r;
    };
    const d1 = calc(12);
    const d2 = calc(13);
    return d1 === parseInt(cnpj.charAt(12)) && d2 === parseInt(cnpj.charAt(13));
  }
}


