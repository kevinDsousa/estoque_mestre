import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  department: string;
  joinDate: Date;
  lastLogin: Date;
  isActive: boolean;
}

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profile: UserProfile = {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    phone: '(11) 99999-9999',
    avatar: '',
    role: 'Administrador',
    department: 'TI',
    joinDate: new Date('2023-01-15'),
    lastLogin: new Date(),
    isActive: true
  };

  activityLogs: ActivityLog[] = [
    {
      id: 1,
      action: 'Login',
      description: 'Login realizado com sucesso',
      timestamp: new Date(),
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      action: 'Atualização de Perfil',
      description: 'Informações pessoais atualizadas',
      timestamp: new Date(Date.now() - 86400000),
      ipAddress: '192.168.1.100'
    },
    {
      id: 3,
      action: 'Alteração de Senha',
      description: 'Senha alterada com sucesso',
      timestamp: new Date(Date.now() - 172800000),
      ipAddress: '192.168.1.100'
    }
  ];

  isEditing = false;
  showChangePassword = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  ngOnInit(): void {
    // Carregar dados do perfil do usuário
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    // TODO: Implementar carregamento real dos dados do usuário
    console.log('Carregando perfil do usuário');
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveProfile(): void {
    // TODO: Implementar salvamento do perfil
    console.log('Salvando perfil:', this.profile);
    this.isEditing = false;
  }

  cancelEdit(): void {
    // TODO: Recarregar dados originais
    this.isEditing = false;
  }

  toggleChangePassword(): void {
    this.showChangePassword = !this.showChangePassword;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (this.newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // TODO: Implementar alteração de senha
    console.log('Alterando senha');
    this.showChangePassword = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }


  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
