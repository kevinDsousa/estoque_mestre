import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../shared/services/toast.service';
import { ValidationService } from '../shared/services/validation.service';

interface Country {
  code: string;
  name: string;
}

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  isCountryLocked = signal(false);

  countries: Country[] = [
    { code: 'BR', name: 'Brasil' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colômbia' },
    { code: 'MX', name: 'México' },
    { code: 'PE', name: 'Peru' },
    { code: 'UY', name: 'Uruguai' },
    { code: 'PY', name: 'Paraguai' },
    { code: 'BO', name: 'Bolívia' },
    { code: 'EC', name: 'Equador' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'GY', name: 'Guiana' },
    { code: 'SR', name: 'Suriname' },
    { code: 'GF', name: 'Guiana Francesa' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService,
    private validationService: ValidationService
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      nationality: ['', Validators.required],
      countryOfOrigin: ['', Validators.required],
      motherCPF: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      fatherCPF: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: [this.passwordMatchValidator, this.cpfValidationValidator] });
  }

  onNationalityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedCountry = target.value;
    
    if (selectedCountry === 'BR') {
      // Se selecionou Brasil, preenche e bloqueia o país de origem
      this.registrationForm.patchValue({ countryOfOrigin: 'BR' });
      this.isCountryLocked.set(true);
      this.registrationForm.get('countryOfOrigin')?.disable();
    } else {
      // Se não é Brasil, desbloqueia o campo
      this.isCountryLocked.set(false);
      this.registrationForm.get('countryOfOrigin')?.enable();
      this.registrationForm.patchValue({ countryOfOrigin: '' });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  cpfValidationValidator(form: FormGroup) {
    const motherCPF = form.get('motherCPF');
    const fatherCPF = form.get('fatherCPF');
    
    if (motherCPF && fatherCPF && motherCPF.value && fatherCPF.value) {
      const result = this.validationService.validateDifferentCPFs(
        motherCPF.value,
        fatherCPF.value,
        'mãe',
        'pai'
      );
      
      if (!result.isValid) {
        // Define erro no formulário
        motherCPF.setErrors({ cpfDuplicate: true });
        fatherCPF.setErrors({ cpfDuplicate: true });
        return { cpfDuplicate: true };
      }
    }
    
    return null;
  }

  formatPhone(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, '');
    
    if (value.length <= 2) {
      value = value;
    } else if (value.length <= 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length <= 10) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
    }
    
    target.value = value;
    this.registrationForm.patchValue({ phone: value });
  }

  formatCPF(event: Event, fieldName: 'motherCPF' | 'fatherCPF'): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    target.value = value;
    this.registrationForm.patchValue({ [fieldName]: value });
    
    // Revalida CPFs quando um deles muda
    if (this.registrationForm.get('motherCPF')?.value && this.registrationForm.get('fatherCPF')?.value) {
      this.cpfValidationValidator(this.registrationForm);
    }
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const formData = this.registrationForm.value;
      
      // Reabilita o campo countryOfOrigin para envio
      if (this.isCountryLocked()) {
        this.registrationForm.get('countryOfOrigin')?.enable();
        formData.countryOfOrigin = 'BR';
      }
      
      console.log('Dados do formulário:', formData);
      
      // Aqui você faria a chamada para a API
      // this.authService.register(formData).subscribe(...)
      
      // Por enquanto, apenas redireciona
      this.router.navigate(['/login']);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} é obrigatório`;
      }
      if (field.errors['email']) {
        return 'Email inválido';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        return 'Formato de telefone inválido';
      }
      if (field.errors['passwordMismatch']) {
        return 'As senhas não coincidem';
      }
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'Nome',
      lastName: 'Sobrenome',
      email: 'Email',
      phone: 'Telefone',
      nationality: 'Nacionalidade',
      countryOfOrigin: 'País de origem',
      motherCPF: 'CPF da mãe',
      fatherCPF: 'CPF do pai',
      password: 'Senha',
      confirmPassword: 'Confirmar senha',
      acceptTerms: 'Termos de uso'
    };
    
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}
