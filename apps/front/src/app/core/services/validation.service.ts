import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface ValidationRule {
  name: string;
  message: string;
  validator: ValidatorFn;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() {}

  /**
   * Email validation
   */
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(control.value) ? null : { email: true };
    };
  }

  /**
   * Phone validation (Brazilian format)
   */
  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
      return phoneRegex.test(control.value) ? null : { phone: true };
    };
  }

  /**
   * CPF validation
   */
  cpfValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const cpf = control.value.replace(/\D/g, '');
      
      if (cpf.length !== 11) return { cpf: true };
      
      // Check for known invalid CPFs
      if (/^(\d)\1{10}$/.test(cpf)) return { cpf: true };
      
      // Validate CPF algorithm
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let remainder = 11 - (sum % 11);
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(9))) return { cpf: true };
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      remainder = 11 - (sum % 11);
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(10))) return { cpf: true };
      
      return null;
    };
  }

  /**
   * CNPJ validation
   */
  cnpjValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const cnpj = control.value.replace(/\D/g, '');
      
      if (cnpj.length !== 14) return { cnpj: true };
      
      // Check for known invalid CNPJs
      if (/^(\d)\1{13}$/.test(cnpj)) return { cnpj: true };
      
      // Validate CNPJ algorithm
      let sum = 0;
      let weight = 2;
      for (let i = 11; i >= 0; i--) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
      }
      let remainder = sum % 11;
      const firstDigit = remainder < 2 ? 0 : 11 - remainder;
      if (firstDigit !== parseInt(cnpj.charAt(12))) return { cnpj: true };
      
      sum = 0;
      weight = 2;
      for (let i = 12; i >= 0; i--) {
        sum += parseInt(cnpj.charAt(i)) * weight;
        weight = weight === 9 ? 2 : weight + 1;
      }
      remainder = sum % 11;
      const secondDigit = remainder < 2 ? 0 : 11 - remainder;
      if (secondDigit !== parseInt(cnpj.charAt(13))) return { cnpj: true };
      
      return null;
    };
  }

  /**
   * CEP validation (Brazilian postal code)
   */
  cepValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const cep = control.value.replace(/\D/g, '');
      const cepRegex = /^\d{8}$/;
      return cepRegex.test(cep) ? null : { cep: true };
    };
  }

  /**
   * Password strength validation
   */
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const password = control.value;
      const errors: ValidationErrors = {};
      
      if (password.length < 8) errors['minLength'] = true;
      if (!/[A-Z]/.test(password)) errors['noUppercase'] = true;
      if (!/[a-z]/.test(password)) errors['noLowercase'] = true;
      if (!/\d/.test(password)) errors['noNumber'] = true;
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors['noSpecialChar'] = true;
      
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * URL validation
   */
  urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      try {
        new URL(control.value);
        return null;
      } catch {
        return { url: true };
      }
    };
  }

  /**
   * Date validation
   */
  dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const date = new Date(control.value);
      return isNaN(date.getTime()) ? { date: true } : null;
    };
  }

  /**
   * Future date validation
   */
  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const date = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return date > today ? null : { futureDate: true };
    };
  }

  /**
   * Past date validation
   */
  pastDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const date = new Date(control.value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      return date < today ? null : { pastDate: true };
    };
  }

  /**
   * Number range validation
   */
  numberRangeValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = Number(control.value);
      if (isNaN(value)) return { number: true };
      
      if (value < min) return { min: { min, actual: value } };
      if (value > max) return { max: { max, actual: value } };
      
      return null;
    };
  }

  /**
   * Positive number validation
   */
  positiveNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = Number(control.value);
      return isNaN(value) || value <= 0 ? { positiveNumber: true } : null;
    };
  }

  /**
   * Integer validation
   */
  integerValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = Number(control.value);
      return isNaN(value) || !Number.isInteger(value) ? { integer: true } : null;
    };
  }

  /**
   * File size validation
   */
  fileSizeValidator(maxSizeInMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const file = control.value as File;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      return file.size > maxSizeInBytes ? { fileSize: { maxSize: maxSizeInMB, actualSize: file.size / 1024 / 1024 } } : null;
    };
  }

  /**
   * File type validation
   */
  fileTypeValidator(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const file = control.value as File;
      return allowedTypes.includes(file.type) ? null : { fileType: { allowedTypes, actualType: file.type } };
    };
  }

  /**
   * SKU validation
   */
  skuValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const sku = control.value.trim();
      const skuRegex = /^[A-Z0-9-_]+$/;
      
      if (sku.length < 3 || sku.length > 50) return { skuLength: true };
      if (!skuRegex.test(sku)) return { skuFormat: true };
      
      return null;
    };
  }

  /**
   * Barcode validation
   */
  barcodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const barcode = control.value.replace(/\D/g, '');
      
      if (barcode.length < 8 || barcode.length > 14) return { barcodeLength: true };
      
      return null;
    };
  }

  /**
   * Get validation error message
   */
  getErrorMessage(error: string, params?: any): string {
    const messages: { [key: string]: string } = {
      required: 'Este campo é obrigatório',
      email: 'Email inválido',
      phone: 'Telefone inválido',
      cpf: 'CPF inválido',
      cnpj: 'CNPJ inválido',
      cep: 'CEP inválido',
      url: 'URL inválida',
      date: 'Data inválida',
      futureDate: 'Data deve ser futura',
      pastDate: 'Data deve ser passada',
      number: 'Valor deve ser um número',
      positiveNumber: 'Valor deve ser positivo',
      integer: 'Valor deve ser um número inteiro',
      minLength: 'Mínimo de caracteres não atingido',
      maxLength: 'Máximo de caracteres excedido',
      min: `Valor mínimo é ${params?.min}`,
      max: `Valor máximo é ${params?.max}`,
      fileSize: `Arquivo muito grande. Máximo ${params?.maxSize}MB`,
      fileType: 'Tipo de arquivo não permitido',
      skuLength: 'SKU deve ter entre 3 e 50 caracteres',
      skuFormat: 'SKU deve conter apenas letras maiúsculas, números, hífens e underscores',
      barcodeLength: 'Código de barras deve ter entre 8 e 14 dígitos',
      minLength: 'Senha deve ter pelo menos 8 caracteres',
      noUppercase: 'Senha deve conter pelo menos uma letra maiúscula',
      noLowercase: 'Senha deve conter pelo menos uma letra minúscula',
      noNumber: 'Senha deve conter pelo menos um número',
      noSpecialChar: 'Senha deve conter pelo menos um caractere especial'
    };

    return messages[error] || 'Valor inválido';
  }

  /**
   * Validate form control
   */
  validateControl(control: AbstractControl): ValidationResult {
    const errors = control.errors;
    if (!errors) {
      return { valid: true, errors: [] };
    }

    const errorMessages = Object.keys(errors).map(error => 
      this.getErrorMessage(error, errors[error])
    );

    return { valid: false, errors: errorMessages };
  }

  /**
   * Format CPF
   */
  formatCPF(value: string): string {
    const cpf = value.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Format CNPJ
   */
  formatCNPJ(value: string): string {
    const cnpj = value.replace(/\D/g, '');
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Format CEP
   */
  formatCEP(value: string): string {
    const cep = value.replace(/\D/g, '');
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  /**
   * Format phone
   */
  formatPhone(value: string): string {
    const phone = value.replace(/\D/g, '');
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  /**
   * Format currency
   */
  formatCurrency(value: string): string {
    const number = value.replace(/\D/g, '');
    const formatted = (Number(number) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return formatted;
  }

  /**
   * Remove formatting
   */
  removeFormatting(value: string): string {
    return value.replace(/\D/g, '');
  }

  /**
   * Validate and format CPF
   */
  validateAndFormatCPF(value: string): { valid: boolean; formatted: string } {
    const cpf = value.replace(/\D/g, '');
    const formatted = this.formatCPF(cpf);
    const valid = cpf.length === 11 && !this.cpfValidator()({ value: cpf } as AbstractControl);
    return { valid, formatted };
  }

  /**
   * Validate and format CNPJ
   */
  validateAndFormatCNPJ(value: string): { valid: boolean; formatted: string } {
    const cnpj = value.replace(/\D/g, '');
    const formatted = this.formatCNPJ(cnpj);
    const valid = cnpj.length === 14 && !this.cnpjValidator()({ value: cnpj } as AbstractControl);
    return { valid, formatted };
  }
}
