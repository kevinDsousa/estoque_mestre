import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardMetricsDto {
  @ApiProperty({ description: 'Métricas de vendas' })
  sales: {
    today: {
      revenue: number;
      orders: number;
      averageOrderValue: number;
      growth: number;
    };
    thisMonth: {
      revenue: number;
      orders: number;
      averageOrderValue: number;
      growth: number;
    };
    thisYear: {
      revenue: number;
      orders: number;
      averageOrderValue: number;
      growth: number;
    };
  };

  @ApiProperty({ description: 'Métricas de estoque' })
  inventory: {
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    turnover: number;
  };

  @ApiProperty({ description: 'Métricas de clientes' })
  customers: {
    total: number;
    newThisMonth: number;
    active: number;
    averageOrderValue: number;
  };

  @ApiProperty({ description: 'Métricas de fornecedores' })
  suppliers: {
    total: number;
    active: number;
    totalPurchases: number;
    averageDeliveryTime: number;
  };

  @ApiProperty({ description: 'Métricas financeiras' })
  financial: {
    revenue: number;
    profit: number;
    expenses: number;
    cashFlow: number;
  };

  @ApiProperty({ description: 'Métricas de qualidade' })
  quality: {
    totalInspections: number;
    passRate: number;
    failedInspections: number;
    averagePassRate: number;
  };

  @ApiProperty({ description: 'Métricas de integração' })
  integration: {
    totalIntegrations: number;
    activeIntegrations: number;
    successfulSyncs: number;
    failedSyncs: number;
  };
}

export class DashboardChartDto {
  @ApiProperty({ description: 'Gráfico de vendas por período' })
  salesChart: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }>;
  };

  @ApiProperty({ description: 'Gráfico de produtos mais vendidos' })
  topProductsChart: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
    }>;
  };

  @ApiProperty({ description: 'Gráfico de categorias' })
  categoriesChart: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string[];
    }>;
  };

  @ApiProperty({ description: 'Gráfico de estoque' })
  inventoryChart: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }>;
  };

  @ApiProperty({ description: 'Gráfico de fluxo de caixa' })
  cashFlowChart: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }>;
  };
}

export class DashboardDto {
  @ApiProperty({ description: 'Métricas do dashboard' })
  metrics: DashboardMetricsDto;

  @ApiProperty({ description: 'Gráficos do dashboard' })
  charts: DashboardChartDto;

  @ApiProperty({ description: 'Alertas e notificações' })
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
    actionRequired: boolean;
  }>;

  @ApiProperty({ description: 'Atividades recentes' })
  activities: Array<{
    id: string;
    type: string;
    description: string;
    user: string;
    timestamp: string;
    metadata?: any;
  }>;

  @ApiProperty({ description: 'Período do dashboard' })
  period: {
    start: string;
    end: string;
    label: string;
  };
}

export class DashboardQueryDto {
  @ApiPropertyOptional({ description: 'Período do dashboard', enum: ['today', 'week', 'month', 'quarter', 'year'] })
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month';

  @ApiPropertyOptional({ description: 'Incluir gráficos', example: true })
  includeCharts?: boolean = true;

  @ApiPropertyOptional({ description: 'Incluir alertas', example: true })
  includeAlerts?: boolean = true;

  @ApiPropertyOptional({ description: 'Incluir atividades recentes', example: true })
  includeActivities?: boolean = true;
}
