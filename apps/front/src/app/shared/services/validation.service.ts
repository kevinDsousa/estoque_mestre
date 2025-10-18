import { Injectable } from '@angular/core';
import { ToastService } from './toast.service';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  constructor(private toastService: ToastService) {}

  /**
   * Valida se dois CPFs são diferentes
   * Previne toasts duplicados usando uma chave única
   */
  validateDifferentCPFs(
    cpf1: string, 
    cpf2: string, 
    field1Name: string = 'CPF da mãe', 
    field2Name: string = 'CPF do pai'
  ): ValidationResult {
    const errors: string[] = [];
    
    // Remove formatação dos CPFs para comparação
    const cleanCpf1 = this.cleanCPF(cpf1);
    const cleanCpf2 = this.cleanCPF(cpf2);
    
    // Verifica se ambos os CPFs são válidos
    if (cleanCpf1 && cleanCpf2) {
      if (cleanCpf1 === cleanCpf2) {
        const errorMessage = `Os CPFs da ${field1Name.toLowerCase()} e do ${field2Name.toLowerCase()} não podem ser iguais. Por favor, verifique os dados informados.`;
        errors.push(errorMessage);
        
        // Mostra toast de erro (o ToastService já previne duplicatas)
        this.toastService.error(
          'CPFs iguais',
          errorMessage,
          8000 // 8 segundos para dar tempo de ler
        );
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida formato de CPF
   */
  validateCPFFormat(cpf: string): ValidationResult {
    const errors: string[] = [];
    const cleanCpf = this.cleanCPF(cpf);
    
    if (!cleanCpf) {
      errors.push('CPF é obrigatório');
    } else if (!this.isValidCPF(cleanCpf)) {
      errors.push('CPF inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida múltiplos campos de uma vez
   * Útil para formulários complexos
   */
  validateForm(formData: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of rules) {
      const result = rule.validate(formData);
      if (!result.isValid) {
        errors.push(...result.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Remove formatação do CPF
   */
  private cleanCPF(cpf: string): string {
    return cpf?.replace(/[^\d]/g, '') || '';
  }

  /**
   * Valida se o CPF é válido usando o algoritmo oficial
   */
  private isValidCPF(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }
}

export interface ValidationRule {
  validate(data: any): ValidationResult;
}

/**
 * Exemplo de regra de validação para CPFs diferentes
 */
export class DifferentCPFsRule implements ValidationRule {
  constructor(
    private cpf1Field: string,
    private cpf2Field: string,
    private field1Name: string,
    private field2Name: string
  ) {}

  validate(data: any): ValidationResult {
    const cpf1 = data[this.cpf1Field];
    const cpf2 = data[this.cpf2Field];
    
    const cleanCpf1 = cpf1?.replace(/[^\d]/g, '') || '';
    const cleanCpf2 = cpf2?.replace(/[^\d]/g, '') || '';
    
    if (cleanCpf1 && cleanCpf2 && cleanCpf1 === cleanCpf2) {
      return {
        isValid: false,
        errors: [`Os CPFs da ${this.field1Name.toLowerCase()} e do ${this.field2Name.toLowerCase()} não podem ser iguais.`]
      };
    }
    
    return { isValid: true, errors: [] };
  }
}
