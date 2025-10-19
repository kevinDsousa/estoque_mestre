import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cep'
})
export class CepPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');

    // Format CEP (8 digits)
    if (numbers.length === 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    // Return original if doesn't match expected pattern
    return value;
  }
}
