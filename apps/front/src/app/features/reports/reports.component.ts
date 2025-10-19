import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  defaultQuery: any;
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  endpoint: string;
  hasAnalytics: boolean;
  hasExport: boolean;
}

interface QuickStats {
  sales: {
    today: number;
    thisMonth: number;
    growth: number;
  };
  inventory: {
    totalProducts: number;
    lowStock: number;
    outOfStock: number;
  };
  financial: {
    revenue: number;
    profit: number;
    expenses: number;
  };
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit, OnDestroy {
  reportTypes: ReportType[] = [];
  reportTemplates: ReportTemplate[] = [];
  quickStats: QuickStats | null = null;
  loading = true;
  error: string | null = null;
  selectedPeriod = 'month';
  selectedReportType = '';

  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadReportData(): void {
    this.loading = true;
    this.error = null;

    // Carregar tipos de relatórios
    this.reportTypes = [
      {
        id: 'sales',
        name: 'Relatórios de Vendas',
        description: 'Análise de vendas, receita e performance',
        icon: 'pi pi-chart-line',
        category: 'Vendas',
        endpoint: 'reports/sales',
        hasAnalytics: true,
        hasExport: true
      },
      {
        id: 'inventory',
        name: 'Relatórios de Estoque',
        description: 'Análise de estoque, movimentação e ABC',
        icon: 'pi pi-box',
        category: 'Estoque',
        endpoint: 'reports/inventory',
        hasAnalytics: true,
        hasExport: true
      },
      {
        id: 'financial',
        name: 'Relatórios Financeiros',
        description: 'Demonstrativos financeiros e fluxo de caixa',
        icon: 'pi pi-dollar',
        category: 'Financeiro',
        endpoint: 'reports/financial',
        hasAnalytics: true,
        hasExport: true
      },
      {
        id: 'customer',
        name: 'Relatórios de Clientes',
        description: 'Análise de clientes e comportamento',
        icon: 'pi pi-users',
        category: 'Clientes',
        endpoint: 'reports/customer',
        hasAnalytics: false,
        hasExport: true
      },
      {
        id: 'supplier',
        name: 'Relatórios de Fornecedores',
        description: 'Performance e análise de fornecedores',
        icon: 'pi pi-building',
        category: 'Fornecedores',
        endpoint: 'reports/supplier',
        hasAnalytics: false,
        hasExport: true
      },
      {
        id: 'product',
        name: 'Relatórios de Produtos',
        description: 'Performance e análise de produtos',
        icon: 'pi pi-tags',
        category: 'Produtos',
        endpoint: 'reports/product',
        hasAnalytics: false,
        hasExport: true
      },
      {
        id: 'transaction',
        name: 'Relatórios de Transações',
        description: 'Histórico e análise de transações',
        icon: 'pi pi-credit-card',
        category: 'Transações',
        endpoint: 'reports/transaction',
        hasAnalytics: false,
        hasExport: true
      },
      {
        id: 'quality',
        name: 'Relatórios de Qualidade',
        description: 'Controle de qualidade e inspeções',
        icon: 'pi pi-check-circle',
        category: 'Qualidade',
        endpoint: 'reports/quality',
        hasAnalytics: false,
        hasExport: true
      },
      {
        id: 'integration',
        name: 'Relatórios de Integração',
        description: 'Status e performance de integrações',
        icon: 'pi pi-link',
        category: 'Integração',
        endpoint: 'reports/integration',
        hasAnalytics: false,
        hasExport: true
      }
    ];

    // Carregar templates de relatórios
    this.loadReportTemplates();

    // Carregar estatísticas rápidas
    this.loadQuickStats();
  }

  private loadReportTemplates(): void {
    this.apiService.get('reports/templates')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.reportTemplates = response.templates || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar templates:', error);
          this.loading = false;
        }
      });
  }

  private loadQuickStats(): void {
    // Carregar estatísticas rápidas em paralelo
    const salesPromise = this.apiService.get('reports/quick/sales-summary').toPromise();
    const inventoryPromise = this.apiService.get('reports/quick/inventory-summary').toPromise();
    const financialPromise = this.apiService.get('reports/quick/financial-summary').toPromise();

    Promise.all([salesPromise, inventoryPromise, financialPromise])
      .then(([sales, inventory, financial]) => {
        this.quickStats = {
          sales: (sales as any) || { today: 0, thisMonth: 0, growth: 0 },
          inventory: (inventory as any) || { totalProducts: 0, lowStock: 0, outOfStock: 0 },
          financial: (financial as any) || { revenue: 0, profit: 0, expenses: 0 }
        };
      })
      .catch((error) => {
        console.error('Erro ao carregar estatísticas rápidas:', error);
        // Definir valores padrão em caso de erro
        this.quickStats = {
          sales: { today: 0, thisMonth: 0, growth: 0 },
          inventory: { totalProducts: 0, lowStock: 0, outOfStock: 0 },
          financial: { revenue: 0, profit: 0, expenses: 0 }
        };
      });
  }

  getReportsByCategory(): { [key: string]: ReportType[] } {
    return this.reportTypes.reduce((acc, report) => {
      if (!acc[report.category]) {
        acc[report.category] = [];
      }
      acc[report.category].push(report);
      return acc;
    }, {} as { [key: string]: ReportType[] });
  }

  generateReport(report: ReportType): void {
    console.log('Gerando relatório:', report.name);
    // TODO: Implementar geração de relatório
    this.selectedReportType = report.id;
  }

  generateAnalytics(report: ReportType): void {
    console.log('Gerando analytics:', report.name);
    // TODO: Implementar analytics
  }

  exportReport(report: ReportType, format: 'PDF' | 'EXCEL' | 'CSV'): void {
    console.log('Exportando relatório:', report.name, 'Formato:', format);
    // TODO: Implementar exportação
  }

  useTemplate(template: ReportTemplate): void {
    console.log('Usando template:', template.name);
    // TODO: Implementar uso de template
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  formatNumber(number: number): string {
    return new Intl.NumberFormat('pt-BR').format(number);
  }

  getGrowthClass(growth: number): string {
    if (growth > 0) return 'growth-positive';
    if (growth < 0) return 'growth-negative';
    return 'growth-neutral';
  }

  getGrowthIcon(growth: number): string {
    if (growth > 0) return 'pi pi-arrow-up';
    if (growth < 0) return 'pi pi-arrow-down';
    return 'pi pi-minus';
  }

  getAbsValue(value: number): number {
    return Math.abs(value);
  }
}