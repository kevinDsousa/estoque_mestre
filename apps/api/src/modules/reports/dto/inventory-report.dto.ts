import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryReportDto {
  @ApiProperty({ description: 'Resumo do estoque' })
  summary: {
    totalProducts: number;
    totalValue: number;
    totalQuantity: number;
    lowStockItems: number;
    outOfStockItems: number;
    overstockItems: number;
  };

  @ApiProperty({ description: 'Análise ABC' })
  abcAnalysis: {
    categoryA: {
      count: number;
      value: number;
      percentage: number;
      products: Array<{
        productId: string;
        productName: string;
        sku: string;
        value: number;
        percentage: number;
      }>;
    };
    categoryB: {
      count: number;
      value: number;
      percentage: number;
      products: Array<{
        productId: string;
        productName: string;
        sku: string;
        value: number;
        percentage: number;
      }>;
    };
    categoryC: {
      count: number;
      value: number;
      percentage: number;
      products: Array<{
        productId: string;
        productName: string;
        sku: string;
        value: number;
        percentage: number;
      }>;
    };
  };

  @ApiProperty({ description: 'Movimentação de estoque' })
  movements: {
    totalMovements: number;
    inboundMovements: number;
    outboundMovements: number;
    adjustments: number;
    transfers: number;
    dailyMovements: Array<{
      date: string;
      inbound: number;
      outbound: number;
      net: number;
    }>;
  };

  @ApiProperty({ description: 'Produtos com estoque baixo' })
  lowStockItems: Array<{
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    daysUntilStockout: number;
    category: string;
  }>;

  @ApiProperty({ description: 'Produtos sem estoque' })
  outOfStockItems: Array<{
    productId: string;
    productName: string;
    sku: string;
    lastStockDate: string;
    category: string;
  }>;

  @ApiProperty({ description: 'Produtos com excesso de estoque' })
  overstockItems: Array<{
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    maxStock: number;
    excessQuantity: number;
    category: string;
  }>;

  @ApiProperty({ description: 'Valor do estoque por categoria' })
  valueByCategory: Array<{
    categoryId: string;
    categoryName: string;
    totalValue: number;
    totalQuantity: number;
    averageValue: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Giro de estoque' })
  turnover: {
    overallTurnover: number;
    turnoverByCategory: Array<{
      categoryId: string;
      categoryName: string;
      turnover: number;
      daysInStock: number;
    }>;
    slowMovingItems: Array<{
      productId: string;
      productName: string;
      sku: string;
      daysInStock: number;
      lastMovement: string;
    }>;
  };

  @ApiPropertyOptional({ description: 'Detalhes dos movimentos' })
  movementDetails?: Array<{
    id: string;
    date: string;
    productName: string;
    type: string;
    quantity: number;
    reason: string;
    user: string;
  }>;
}

export class InventoryAnalyticsDto {
  @ApiProperty({ description: 'Métricas de eficiência' })
  efficiency: {
    stockTurnover: number;
    fillRate: number;
    stockoutRate: number;
    carryingCost: number;
  };

  @ApiProperty({ description: 'Previsões de demanda' })
  demandForecast: {
    nextMonthDemand: number;
    seasonalFactors: Array<{
      month: string;
      factor: number;
    }>;
    recommendedStockLevels: Array<{
      productId: string;
      productName: string;
      recommendedStock: number;
      confidence: number;
    }>;
  };

  @ApiProperty({ description: 'Análise de custos' })
  costAnalysis: {
    totalCarryingCost: number;
    stockoutCost: number;
    orderingCost: number;
    totalCost: number;
    costByCategory: Array<{
      categoryId: string;
      categoryName: string;
      carryingCost: number;
      stockoutCost: number;
    }>;
  };
}
