import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone'
})
export class PhonePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    // Remove all non-digit characters
    const phone = value.replace(/\D/g, '');

    // Format based on length
    if (phone.length === 11) {
      // Mobile phone: (XX) XXXXX-XXXX
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      // Landline: (XX) XXXX-XXXX
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 13 && phone.startsWith('55')) {
      // International format: +55 (XX) XXXXX-XXXX
      return phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
    } else if (phone.length === 12 && phone.startsWith('55')) {
      // International format: +55 (XX) XXXX-XXXX
      return phone.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 ($2) $3-$4');
    }

    // Return original if doesn't match expected patterns
    return value;
  }
}
