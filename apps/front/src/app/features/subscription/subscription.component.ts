import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

interface Subscription {
  id: string;
  planId: string;
  plan: {
    id: string;
    name: string;
    type: string;
    description?: string;
  };
  company: {
    id: string;
    name: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  features: any;
  billing: any;
  isInTrial: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate?: Date;
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  cancellationReason?: string;
  payments?: Payment[];
  createdAt: Date;
  updatedAt: Date;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  paidAt?: Date;
  createdAt: Date;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  type: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  monthlyPrice: number;
  yearlyPrice?: number;
  currency: string;
  features: any;
  isPopular: boolean;
  isRecommended: boolean;
  trialDays: number;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit, OnDestroy {
  currentSubscription: Subscription | null = null;
  availablePlans: SubscriptionPlan[] = [];
  loading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSubscriptionData(): void {
    this.loading = true;
    this.error = null;

    // Carregar assinatura atual
    this.apiService.get('subscriptions/company')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // O backend retorna array direto, não { data: [] }
          if (Array.isArray(response) && response.length > 0) {
            this.currentSubscription = response[0]; // Assumindo que a empresa tem apenas uma assinatura ativa
          } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            this.currentSubscription = response.data[0]; // Fallback para estrutura paginada
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar assinatura:', error);
          this.error = 'Erro ao carregar informações da assinatura';
          this.loading = false;
        }
      });

    // Carregar planos disponíveis - usar endpoint público
    this.apiService.get('subscription-plans/public')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // Verificar se é array direto ou estrutura paginada
          if (Array.isArray(response)) {
            this.availablePlans = response;
          } else if (response.data && Array.isArray(response.data)) {
            this.availablePlans = response.data;
          } else if (response.plans && Array.isArray(response.plans)) {
            this.availablePlans = response.plans;
          }
        },
        error: (error) => {
          console.error('Erro ao carregar planos:', error);
          // Fallback para endpoint autenticado se o público falhar
          this.loadPlansFallback();
        }
      });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Ativa',
      'INACTIVE': 'Inativa',
      'CANCELED': 'Cancelada',
      'PAST_DUE': 'Vencida',
      'UNPAID': 'Não Paga'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'ACTIVE': 'status-active',
      'INACTIVE': 'status-inactive',
      'CANCELED': 'status-canceled',
      'PAST_DUE': 'status-past-due',
      'UNPAID': 'status-unpaid'
    };
    return classMap[status] || '';
  }

  getPaymentStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'PROCESSING': 'Processando',
      'SUCCEEDED': 'Pago',
      'FAILED': 'Falhou',
      'CANCELED': 'Cancelado',
      'REFUNDED': 'Reembolsado',
      'PARTIALLY_REFUNDED': 'Parcialmente Reembolsado'
    };
    return statusMap[status] || status;
  }

  getPaymentStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'PENDING': 'payment-pending',
      'PROCESSING': 'payment-processing',
      'SUCCEEDED': 'payment-success',
      'FAILED': 'payment-failed',
      'CANCELED': 'payment-canceled',
      'REFUNDED': 'payment-refunded',
      'PARTIALLY_REFUNDED': 'payment-partial'
    };
    return classMap[status] || '';
  }

  formatPrice(amount: number, currency: string = 'BRL'): string {
    const value = amount / 100; // Converter de centavos para reais
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR').format(dateObj);
  }

  isTrialActive(): boolean {
    if (!this.currentSubscription?.isInTrial) return false;
    if (!this.currentSubscription.trialEnd) return false;
    return new Date() < new Date(this.currentSubscription.trialEnd);
  }

  getTrialDaysRemaining(): number {
    if (!this.isTrialActive()) return 0;
    const now = new Date();
    const trialEnd = new Date(this.currentSubscription!.trialEnd!);
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  cancelSubscription(): void {
    if (!this.currentSubscription) return;
    
    if (confirm('Tem certeza que deseja cancelar sua assinatura? Ela permanecerá ativa até o final do período atual.')) {
      // TODO: Implementar cancelamento
      console.log('Cancelando assinatura:', this.currentSubscription.id);
    }
  }

  upgradePlan(): void {
    // TODO: Implementar upgrade de plano
    console.log('Upgrading plan...');
  }

  selectPlan(plan: SubscriptionPlan): void {
    console.log('Selecionando plano:', plan.name);
    // TODO: Implementar seleção de plano
  }

  viewBillingHistory(): void {
    // TODO: Implementar histórico de cobrança
    console.log('Viewing billing history...');
  }

  private loadPlansFallback(): void {
    // Fallback para endpoint autenticado se o público falhar
    this.apiService.get('subscription-plans')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response)) {
            this.availablePlans = response;
          } else if (response.data && Array.isArray(response.data)) {
            this.availablePlans = response.data;
          } else if (response.plans && Array.isArray(response.plans)) {
            this.availablePlans = response.plans;
          }
        },
        error: (error) => {
          console.error('Erro ao carregar planos (fallback):', error);
        }
      });
  }

  getPlanFeatures(features: any): string[] {
    if (!features) return [];
    
    // Se features é um objeto, converter para array de strings
    if (typeof features === 'object') {
      return Object.entries(features)
        .filter(([key, value]) => value === true)
        .map(([key, value]) => this.formatFeatureName(key));
    }
    
    // Se já é um array, retornar como está
    if (Array.isArray(features)) {
      return features;
    }
    
    return [];
  }

  private formatFeatureName(featureKey: string): string {
    // Converter chaves como "maxProducts" para "Máximo de Produtos"
    const featureMap: { [key: string]: string } = {
      'maxProducts': 'Produtos ilimitados',
      'maxUsers': 'Usuários ilimitados',
      'advancedReports': 'Relatórios avançados',
      'apiAccess': 'Acesso à API',
      'prioritySupport': 'Suporte prioritário',
      'customBranding': 'Marca personalizada',
      'dataExport': 'Exportação de dados',
      'backup': 'Backup automático'
    };
    
    return featureMap[featureKey] || featureKey;
  }

  get planName(): string {
    return this.currentSubscription?.plan?.name || 'Plano não encontrado';
  }

  get planDescription(): string {
    return this.currentSubscription?.plan?.description || '';
  }

  calculateDiscount(yearlyPrice: number, monthlyPrice: number): number {
    return Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);
  }
}
