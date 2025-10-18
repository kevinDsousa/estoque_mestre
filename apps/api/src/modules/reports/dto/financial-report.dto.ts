import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FinancialReportDto {
  @ApiProperty({ description: 'Período do relatório' })
  period: {
    start: string;
    end: string;
    label: string;
  };

  @ApiProperty({ description: 'Demonstrativo de resultados' })
  incomeStatement: {
    revenue: {
      grossSales: number;
      discounts: number;
      returns: number;
      netSales: number;
    };
    costOfGoodsSold: {
      beginningInventory: number;
      purchases: number;
      endingInventory: number;
      totalCost: number;
    };
    grossProfit: number;
    operatingExpenses: {
      salaries: number;
      rent: number;
      utilities: number;
      marketing: number;
      other: number;
      total: number;
    };
    operatingIncome: number;
    otherIncome: number;
    otherExpenses: number;
    netIncome: number;
  };

  @ApiProperty({ description: 'Fluxo de caixa' })
  cashFlow: {
    operating: {
      netIncome: number;
      depreciation: number;
      changesInWorkingCapital: number;
      total: number;
    };
    investing: {
      equipmentPurchases: number;
      otherInvestments: number;
      total: number;
    };
    financing: {
      loansReceived: number;
      loanPayments: number;
      dividends: number;
      total: number;
    };
    netCashFlow: number;
    beginningCash: number;
    endingCash: number;
  };

  @ApiProperty({ description: 'Balanço patrimonial' })
  balanceSheet: {
    assets: {
      current: {
        cash: number;
        accountsReceivable: number;
        inventory: number;
        other: number;
        total: number;
      };
      fixed: {
        equipment: number;
        depreciation: number;
        net: number;
      };
      total: number;
    };
    liabilities: {
      current: {
        accountsPayable: number;
        shortTermDebt: number;
        other: number;
        total: number;
      };
      longTerm: {
        longTermDebt: number;
        other: number;
        total: number;
      };
      total: number;
    };
    equity: {
      capital: number;
      retainedEarnings: number;
      total: number;
    };
  };

  @ApiProperty({ description: 'Análise de rentabilidade' })
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
  };

  @ApiProperty({ description: 'Análise de liquidez' })
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
  };

  @ApiProperty({ description: 'Análise de endividamento' })
  leverage: {
    debtToEquity: number;
    debtToAssets: number;
    interestCoverage: number;
  };

  @ApiPropertyOptional({ description: 'Detalhes das transações financeiras' })
  transactions?: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    amount: number;
    category: string;
  }>;
}

export class FinancialAnalyticsDto {
  @ApiProperty({ description: 'Tendências financeiras' })
  trends: {
    revenueGrowth: number;
    profitGrowth: number;
    expenseGrowth: number;
    marginTrends: Array<{
      period: string;
      grossMargin: number;
      operatingMargin: number;
      netMargin: number;
    }>;
  };

  @ApiProperty({ description: 'Análise de sazonalidade' })
  seasonality: {
    revenueByMonth: Array<{
      month: string;
      revenue: number;
      percentage: number;
    }>;
    expenseByMonth: Array<{
      month: string;
      expenses: number;
      percentage: number;
    }>;
  };

  @ApiProperty({ description: 'Previsões financeiras' })
  forecasts: {
    nextMonthRevenue: number;
    nextQuarterRevenue: number;
    nextYearRevenue: number;
    confidence: number;
  };

  @ApiProperty({ description: 'Análise de custos' })
  costAnalysis: {
    costByCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
      trend: number;
    }>;
    costEfficiency: {
      costPerSale: number;
      costPerCustomer: number;
      costPerProduct: number;
    };
  };
}
