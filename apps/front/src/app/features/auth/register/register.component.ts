import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  company: string;
  position: string;
  acceptTerms: boolean;
  acceptNewsletter: boolean;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  form: RegisterForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company: '',
    position: '',
    acceptTerms: false,
    acceptNewsletter: false
  };

  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  errors: { [key: string]: string } = {};

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Verificar se já está logado
    // TODO: Implementar verificação de autenticação
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validateForm(): boolean {
    this.errors = {};

    // Nome
    if (!this.form['firstName'].trim()) {
      this.errors['firstName'] = 'Nome é obrigatório';
    }

    // Sobrenome
    if (!this.form['lastName'].trim()) {
      this.errors['lastName'] = 'Sobrenome é obrigatório';
    }

    // Email
    if (!this.form['email'].trim()) {
      this.errors['email'] = 'Email é obrigatório';
    } else if (!this.isValidEmail(this.form['email'])) {
      this.errors['email'] = 'Email inválido';
    }

    // Telefone
    if (!this.form['phone'].trim()) {
      this.errors['phone'] = 'Telefone é obrigatório';
    }

    // Senha
    if (!this.form['password']) {
      this.errors['password'] = 'Senha é obrigatória';
    } else if (this.form['password'].length < 6) {
      this.errors['password'] = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Confirmar senha
    if (!this.form['confirmPassword']) {
      this.errors['confirmPassword'] = 'Confirmação de senha é obrigatória';
    } else if (this.form['password'] !== this.form['confirmPassword']) {
      this.errors['confirmPassword'] = 'Senhas não coincidem';
    }

    // Empresa
    if (!this.form['company'].trim()) {
      this.errors['company'] = 'Nome da empresa é obrigatório';
    }

    // Cargo
    if (!this.form['position'].trim()) {
      this.errors['position'] = 'Cargo é obrigatório';
    }

    // Termos
    if (!this.form['acceptTerms']) {
      this.errors['acceptTerms'] = 'Você deve aceitar os termos de uso';
    }

    return Object.keys(this.errors).length === 0;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    // TODO: Implementar chamada para API de registro
    console.log('Dados do registro:', this.form);

    // Simular chamada à API
    setTimeout(() => {
      this.isLoading = false;
      // TODO: Implementar redirecionamento após registro bem-sucedido
      this.router.navigate(['/login']);
    }, 2000);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  hasError(field: string): boolean {
    return !!this.errors[field];
  }

  getError(field: string): string {
    return this.errors[field] || '';
  }
}
