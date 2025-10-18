import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SalesReportDto {
  @ApiProperty({ description: 'Período do relatório' })
  period: {
    start: string;
    end: string;
    label: string;
  };

  @ApiProperty({ description: 'Resumo de vendas' })
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalDiscounts: number;
    totalTaxes: number;
    netRevenue: number;
  };

  @ApiProperty({ description: 'Tendências de vendas' })
  trends: {
    daily: Array<{
      date: string;
      sales: number;
      revenue: number;
      orders: number;
    }>;
    weekly: Array<{
      week: string;
      sales: number;
      revenue: number;
      orders: number;
    }>;
    monthly: Array<{
      month: string;
      sales: number;
      revenue: number;
      orders: number;
    }>;
  };

  @ApiProperty({ description: 'Top produtos vendidos' })
  topProducts: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantitySold: number;
    revenue: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Top clientes' })
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
  }>;

  @ApiProperty({ description: 'Vendas por categoria' })
  salesByCategory: Array<{
    categoryId: string;
    categoryName: string;
    totalSales: number;
    totalRevenue: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Vendas por método de pagamento' })
  salesByPaymentMethod: Array<{
    method: string;
    count: number;
    total: number;
    percentage: number;
  }>;

  @ApiPropertyOptional({ description: 'Detalhes das transações' })
  transactions?: Array<{
    id: string;
    date: string;
    customerName: string;
    total: number;
    status: string;
    paymentMethod: string;
  }>;
}

export class SalesAnalyticsDto {
  @ApiProperty({ description: 'Métricas de crescimento' })
  growth: {
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
    averageOrderValueGrowth: number;
  };

  @ApiProperty({ description: 'Métricas de conversão' })
  conversion: {
    conversionRate: number;
    cartAbandonmentRate: number;
    repeatPurchaseRate: number;
    customerLifetimeValue: number;
  };

  @ApiProperty({ description: 'Análise de sazonalidade' })
  seasonality: {
    peakDays: string[];
    peakHours: number[];
    seasonalTrends: Array<{
      month: string;
      factor: number;
    }>;
  };

  @ApiProperty({ description: 'Previsões' })
  forecasts: {
    nextMonthRevenue: number;
    nextQuarterRevenue: number;
    confidence: number;
  };
}
