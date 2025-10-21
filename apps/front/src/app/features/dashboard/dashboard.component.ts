import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { DashboardService, DashboardStats, QuickStats, RecentActivity, LowStockProduct, PendingOrder } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  quickStats: QuickStats | null = null;
  recentActivity: RecentActivity[] = [];
  lowStockProducts: LowStockProduct[] = [];
  pendingOrders: PendingOrder[] = [];
  loading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Carregar estatísticas principais
    this.dashboardService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Erro ao carregar estatísticas:', error);
          this.error = 'Erro ao carregar estatísticas do dashboard';
        }
      });

    // Carregar estatísticas rápidas
    this.dashboardService.getQuickStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (quickStats) => {
          this.quickStats = quickStats;
        },
        error: (error) => {
          console.error('Erro ao carregar estatísticas rápidas:', error);
        }
      });

    // Carregar atividades recentes
    this.dashboardService.getRecentActivity(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (activities) => {
          this.recentActivity = activities;
        },
        error: (error) => {
          console.error('Erro ao carregar atividades recentes:', error);
        }
      });

    // Carregar produtos com estoque baixo
    this.dashboardService.getLowStockProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.lowStockProducts = products;
        },
        error: (error) => {
          console.error('Erro ao carregar produtos com estoque baixo:', error);
        }
      });

    // Carregar pedidos pendentes
    this.dashboardService.getPendingOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.pendingOrders = orders;
        },
        error: (error) => {
          console.error('Erro ao carregar pedidos pendentes:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  /**
   * Navega para a página de relatórios
   */
  goToReports(): void {
    this.router.navigate(['/relatorios']);
  }

  /**
   * Navega para a página de produtos com filtro de estoque baixo
   */
  goToLowStockProducts(): void {
    this.router.navigate(['/produtos'], { 
      queryParams: { 
        stockFilter: 'low' 
      } 
    });
  }

  /**
   * Navega para a página de produtos
   */
  goToProducts(): void {
    this.router.navigate(['/produtos']);
  }

  /**
   * Navega para a página de categorias
   */
  goToCategories(): void {
    this.router.navigate(['/categorias']);
  }

  /**
   * Navega para a página de fornecedores
   */
  goToSuppliers(): void {
    this.router.navigate(['/fornecedores']);
  }

  /**
   * Navega para a página de clientes
   */
  goToCustomers(): void {
    this.router.navigate(['/clientes']);
  }

  /**
   * Navega para a página de transações
   */
  goToTransactions(): void {
    this.router.navigate(['/transacoes']);
  }

  /**
   * Navega para a página de transações pendentes
   */
  goToPendingOrders(): void {
    this.router.navigate(['/transacoes'], { 
      queryParams: { 
        status: 'PENDING' 
      } 
    });
  }

  /**
   * Formata valores monetários
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formata números
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  /**
   * Formata data
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  /**
   * Formata data e hora
   */
  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('pt-BR');
  }

  /**
   * Obtém a classe CSS para o status do produto
   */
  getStockStatusClass(stock: number, minStock: number): string {
    if (stock === 0) return 'stock-out';
    if (stock < minStock) return 'stock-low';
    return 'stock-normal';
  }

  /**
   * Obtém o label para o status do estoque
   */
  getStockStatusLabel(stock: number, minStock: number): string {
    if (stock === 0) return 'Sem estoque';
    if (stock < minStock) return 'Estoque baixo';
    return 'Estoque normal';
  }

  /**
   * Obtém a classe CSS para o tipo de atividade
   */
  getActivityTypeClass(type: string): string {
    switch (type) {
      case 'sale':
        return 'activity-sale';
      case 'purchase':
        return 'activity-purchase';
      case 'stock_adjustment':
        return 'activity-adjustment';
      case 'user_login':
        return 'activity-login';
      case 'product_created':
        return 'activity-product';
      case 'customer_created':
        return 'activity-customer';
      default:
        return 'activity-default';
    }
  }

  /**
   * Obtém o ícone para o tipo de atividade
   */
  getActivityIcon(type: string): string {
    switch (type) {
      case 'sale':
        return 'pi pi-shopping-cart';
      case 'purchase':
        return 'pi pi-shopping-bag';
      case 'stock_adjustment':
        return 'pi pi-refresh';
      case 'user_login':
        return 'pi pi-user';
      case 'product_created':
        return 'pi pi-plus';
      case 'customer_created':
        return 'pi pi-users';
      default:
        return 'pi pi-info-circle';
    }
  }

  /**
   * Obtém a classe CSS para o status da transação
   */
  getTransactionStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  /**
   * Obtém o label para o status da transação
   */
  getTransactionStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  }

  /**
   * Verifica se há dados para exibir
   */
  hasData(): boolean {
    return !this.loading && !this.error && this.stats !== null;
  }

  /**
   * Verifica se há produtos com estoque baixo
   */
  hasLowStockProducts(): boolean {
    return this.lowStockProducts.length > 0;
  }

  /**
   * Verifica se há pedidos pendentes
   */
  hasPendingOrders(): boolean {
    return this.pendingOrders.length > 0;
  }

  /**
   * Verifica se há atividades recentes
   */
  hasRecentActivity(): boolean {
    return this.recentActivity.length > 0;
  }
}