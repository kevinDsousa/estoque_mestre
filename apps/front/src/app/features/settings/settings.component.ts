import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewToggleComponent } from '../../core/components';
import { ViewPreferencesService, ViewMode } from '../../core/services/view-preferences.service';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  settings: Setting[];
}

interface Setting {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  value: any;
  options?: { label: string; value: any }[];
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewToggleComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settingsSections: SettingSection[] = [];
  currentView: ViewMode = 'cards';
  activeSection = 'general';

  constructor(private viewPreferencesService: ViewPreferencesService) {}

  ngOnInit(): void {
    this.currentView = this.viewPreferencesService.getViewPreference('settings');
    this.settingsSections = [
      {
        id: 'general',
        title: 'Geral',
        description: 'Configurações gerais do sistema',
        icon: 'pi pi-cog',
        settings: [
          {
            id: 'company_name',
            name: 'Nome da Empresa',
            description: 'Nome que aparecerá no sistema',
            type: 'text',
            value: 'Estoque Mestre'
          },
          {
            id: 'currency',
            name: 'Moeda',
            description: 'Moeda padrão para valores',
            type: 'select',
            value: 'BRL',
            options: [
              { label: 'Real (R$)', value: 'BRL' },
              { label: 'Dólar ($)', value: 'USD' },
              { label: 'Euro (€)', value: 'EUR' }
            ]
          },
          {
            id: 'timezone',
            name: 'Fuso Horário',
            description: 'Fuso horário do sistema',
            type: 'select',
            value: 'America/Sao_Paulo',
            options: [
              { label: 'São Paulo (GMT-3)', value: 'America/Sao_Paulo' },
              { label: 'Nova York (GMT-5)', value: 'America/New_York' },
              { label: 'Londres (GMT+0)', value: 'Europe/London' }
            ]
          }
        ]
      },
      {
        id: 'inventory',
        title: 'Estoque',
        description: 'Configurações de controle de estoque',
        icon: 'pi pi-box',
        settings: [
          {
            id: 'low_stock_threshold',
            name: 'Limite de Estoque Baixo',
            description: 'Quantidade mínima para alerta de estoque baixo',
            type: 'number',
            value: 5
          },
          {
            id: 'auto_reorder',
            name: 'Reposição Automática',
            description: 'Ativar reposição automática de estoque',
            type: 'boolean',
            value: false
          },
          {
            id: 'track_expiry',
            name: 'Controle de Validade',
            description: 'Ativar controle de validade de produtos',
            type: 'boolean',
            value: true
          }
        ]
      },
      {
        id: 'notifications',
        title: 'Notificações',
        description: 'Configurações de alertas e notificações',
        icon: 'pi pi-bell',
        settings: [
          {
            id: 'email_notifications',
            name: 'Notificações por Email',
            description: 'Receber notificações por email',
            type: 'boolean',
            value: true
          },
          {
            id: 'low_stock_alerts',
            name: 'Alertas de Estoque Baixo',
            description: 'Receber alertas quando estoque estiver baixo',
            type: 'boolean',
            value: true
          },
          {
            id: 'expiry_alerts',
            name: 'Alertas de Validade',
            description: 'Receber alertas de produtos próximos do vencimento',
            type: 'boolean',
            value: true
          }
        ]
      },
      {
        id: 'security',
        title: 'Segurança',
        description: 'Configurações de segurança e privacidade',
        icon: 'pi pi-shield',
        settings: [
          {
            id: 'session_timeout',
            name: 'Timeout de Sessão',
            description: 'Tempo em minutos para expirar sessão inativa',
            type: 'number',
            value: 30
          },
          {
            id: 'two_factor_auth',
            name: 'Autenticação de Dois Fatores',
            description: 'Ativar autenticação de dois fatores',
            type: 'boolean',
            value: false
          },
          {
            id: 'password_policy',
            name: 'Política de Senhas',
            description: 'Exigir senhas complexas',
            type: 'boolean',
            value: true
          }
        ]
      }
    ];
  }

  getActiveSection(): SettingSection | undefined {
    return this.settingsSections.find(section => section.id === this.activeSection);
  }

  setActiveSection(sectionId: string): void {
    this.activeSection = sectionId;
  }

  saveSettings(): void {
    console.log('Salvando configurações...');
    // TODO: Implementar salvamento das configurações
  }

  onViewChange(view: ViewMode): void {
    this.currentView = view;
    this.viewPreferencesService.setViewPreference('settings', view);
  }

  resetSettings(): void {
    if (confirm('Tem certeza que deseja redefinir todas as configurações?')) {
      console.log('Redefinindo configurações...');
      // TODO: Implementar reset das configurações
    }
  }
}