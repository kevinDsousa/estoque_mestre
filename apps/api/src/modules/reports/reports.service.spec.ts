import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../../database/prisma.service';
import { ReportsService } from './reports.service';
import { AuthContextService } from '../../common/services/auth-context.service';
import { ReportType, ReportPeriod, ReportFormat } from './dto/report-query.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaService: DeepMockProxy<PrismaService>;
  let authContextService: DeepMockProxy<AuthContextService>;

  const mockCompanyId = 'company-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: AuthContextService,
          useValue: mockDeep<AuthContextService>(),
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prismaService = module.get(PrismaService);
    authContextService = module.get(AuthContextService);

    // Reset all mocks
    mockReset(prismaService);
    mockReset(authContextService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return dashboard data with all components', async () => {
      // Arrange
      const query = {
        period: 'month' as const,
        includeCharts: true,
        includeAlerts: true,
        includeActivities: true,
      };

      // Act
      const result = await service.getDashboard(mockCompanyId, query);

      // Assert
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('charts');
      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('activities');
      expect(result).toHaveProperty('period');

      expect(result.metrics).toHaveProperty('sales');
      expect(result.metrics).toHaveProperty('inventory');
      expect(result.metrics).toHaveProperty('customers');
      expect(result.metrics).toHaveProperty('suppliers');
      expect(result.metrics).toHaveProperty('financial');
      expect(result.metrics).toHaveProperty('quality');
      expect(result.metrics).toHaveProperty('integration');

      expect(result.charts).toHaveProperty('salesChart');
      expect(result.charts).toHaveProperty('topProductsChart');
      expect(result.charts).toHaveProperty('categoriesChart');
      expect(result.charts).toHaveProperty('inventoryChart');
      expect(result.charts).toHaveProperty('cashFlowChart');
    });

    it('should return dashboard data without charts when includeCharts is false', async () => {
      // Arrange
      const query = {
        period: 'month' as const,
        includeCharts: false,
        includeAlerts: true,
        includeActivities: true,
      };

      // Act
      const result = await service.getDashboard(mockCompanyId, query);

      // Assert
      expect(result).toHaveProperty('metrics');
      expect(result.charts).toEqual({});
    });
  });

  describe('getSalesReport', () => {
    it('should return sales report with all components', async () => {
      // Arrange
      const query = {
        period: ReportPeriod.MONTHLY,
        includeDetails: true,
      };

      // Act
      const result = await service.getSalesReport(mockCompanyId, query);

      // Assert
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('topProducts');
      expect(result).toHaveProperty('topCustomers');
      expect(result).toHaveProperty('salesByCategory');
      expect(result).toHaveProperty('salesByPaymentMethod');
      expect(result).toHaveProperty('transactions');

      expect(result.summary).toHaveProperty('totalSales');
      expect(result.summary).toHaveProperty('totalRevenue');
      expect(result.summary).toHaveProperty('totalOrders');
      expect(result.summary).toHaveProperty('averageOrderValue');
      expect(result.summary).toHaveProperty('totalDiscounts');
      expect(result.summary).toHaveProperty('totalTaxes');
      expect(result.summary).toHaveProperty('netRevenue');
    });

    it('should return sales report without details when includeDetails is false', async () => {
      // Arrange
      const query = {
        period: ReportPeriod.MONTHLY,
        includeDetails: false,
      };

      // Act
      const result = await service.getSalesReport(mockCompanyId, query);

      // Assert
      expect(result.transactions).toBeUndefined();
    });
  });

  describe('getSalesAnalytics', () => {
    it('should return sales analytics with growth metrics', async () => {
      // Arrange
      const query = {
        period: ReportPeriod.MONTHLY,
      };

      // Act
      const result = await service.getSalesAnalytics(mockCompanyId, query);

      // Assert
      expect(result).toHaveProperty('growth');
      expect(result).toHaveProperty('conversion');
      expect(result).toHaveProperty('seasonality');
      expect(result).toHaveProperty('forecasts');

      expect(result.growth).toHaveProperty('revenueGrowth');
      expect(result.growth).toHaveProperty('orderGrowth');
      expect(result.growth).toHaveProperty('customerGrowth');
      expect(result.growth).toHaveProperty('averageOrderValueGrowth');

      expect(result.conversion).toHaveProperty('conversionRate');
      expect(result.conversion).toHaveProperty('cartAbandonmentRate');
      expect(result.conversion).toHaveProperty('repeatPurchaseRate');
      expect(result.conversion).toHaveProperty('customerLifetimeValue');

      expect(result.seasonality).toHaveProperty('peakDays');
      expect(result.seasonality).toHaveProperty('peakHours');
      expect(result.seasonality).toHaveProperty('seasonalTrends');

      expect(result.forecasts).toHaveProperty('nextMonthRevenue');
      expect(result.forecasts).toHaveProperty('nextQuarterRevenue');
      expect(result.forecasts).toHaveProperty('confidence');
    });
  });

  describe('getInventoryReport', () => {
    it('should return inventory report with all components', async () => {
      // Arrange
      const query = {
        includeDetails: true,
      };

      // Act
      const result = await service.getInventoryReport(mockCompanyId, query);

      // Assert
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('abcAnalysis');
      expect(result).toHaveProperty('movements');
      expect(result).toHaveProperty('lowStockItems');
      expect(result).toHaveProperty('outOfStockItems');
      expect(result).toHaveProperty('overstockItems');
      expect(result).toHaveProperty('valueByCategory');
      expect(result).toHaveProperty('turnover');
      expect(result).toHaveProperty('movementDetails');

      expect(result.summary).toHaveProperty('totalProducts');
      expect(result.summary).toHaveProperty('totalValue');
      expect(result.summary).toHaveProperty('totalQuantity');
      expect(result.summary).toHaveProperty('lowStockItems');
      expect(result.summary).toHaveProperty('outOfStockItems');
      expect(result.summary).toHaveProperty('overstockItems');

      expect(result.abcAnalysis).toHaveProperty('categoryA');
      expect(result.abcAnalysis).toHaveProperty('categoryB');
      expect(result.abcAnalysis).toHaveProperty('categoryC');
    });

    it('should return inventory report without details when includeDetails is false', async () => {
      // Arrange
      const query = {
        includeDetails: false,
      };

      // Act
      const result = await service.getInventoryReport(mockCompanyId, query);

      // Assert
      expect(result.movementDetails).toBeUndefined();
    });
  });

  describe('getInventoryAnalytics', () => {
    it('should return inventory analytics with efficiency metrics', async () => {
      // Arrange
      const query = {};

      // Act
      const result = await service.getInventoryAnalytics(mockCompanyId, query);

      // Assert
      expect(result).toHaveProperty('efficiency');
      expect(result).toHaveProperty('demandForecast');
      expect(result).toHaveProperty('costAnalysis');

      expect(result.efficiency).toHaveProperty('stockTurnover');
      expect(result.efficiency).toHaveProperty('fillRate');
      expect(result.efficiency).toHaveProperty('stockoutRate');
      expect(result.efficiency).toHaveProperty('carryingCost');

      expect(result.demandForecast).toHaveProperty('nextMonthDemand');
      expect(result.demandForecast).toHaveProperty('seasonalFactors');
      expect(result.demandForecast).toHaveProperty('recommendedStockLevels');

      expect(result.costAnalysis).toHaveProperty('totalCarryingCost');
      expect(result.costAnalysis).toHaveProperty('stockoutCost');
      expect(result.costAnalysis).toHaveProperty('orderingCost');
      expect(result.costAnalysis).toHaveProperty('totalCost');
      expect(result.costAnalysis).toHaveProperty('costByCategory');
    });
  });

  describe('getFinancialReport', () => {
    it('should return financial report with all components', async () => {
      // Arrange
      const query = {
        period: ReportPeriod.MONTHLY,
        includeDetails: true,
      };

      // Act
      const result = await service.getFinancialReport(mockCompanyId, query);

      // Assert
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('incomeStatement');
      expect(result).toHaveProperty('cashFlow');
      expect(result).toHaveProperty('balanceSheet');
      expect(result).toHaveProperty('profitability');
      expect(result).toHaveProperty('liquidity');
      expect(result).toHaveProperty('leverage');
      expect(result).toHaveProperty('transactions');

      expect(result.incomeStatement).toHaveProperty('revenue');
      expect(result.incomeStatement).toHaveProperty('costOfGoodsSold');
      expect(result.incomeStatement).toHaveProperty('grossProfit');
      expect(result.incomeStatement).toHaveProperty('operatingExpenses');
      expect(result.incomeStatement).toHaveProperty('operatingIncome');
      expect(result.incomeStatement).toHaveProperty('otherIncome');
      expect(result.incomeStatement).toHaveProperty('otherExpenses');
      expect(result.incomeStatement).toHaveProperty('netIncome');

      expect(result.cashFlow).toHaveProperty('operating');
      expect(result.cashFlow).toHaveProperty('investing');
      expect(result.cashFlow).toHaveProperty('financing');
      expect(result.cashFlow).toHaveProperty('netCashFlow');
      expect(result.cashFlow).toHaveProperty('beginningCash');
      expect(result.cashFlow).toHaveProperty('endingCash');

      expect(result.balanceSheet).toHaveProperty('assets');
      expect(result.balanceSheet).toHaveProperty('liabilities');
      expect(result.balanceSheet).toHaveProperty('equity');

      expect(result.profitability).toHaveProperty('grossMargin');
      expect(result.profitability).toHaveProperty('operatingMargin');
      expect(result.profitability).toHaveProperty('netMargin');
      expect(result.profitability).toHaveProperty('returnOnAssets');
      expect(result.profitability).toHaveProperty('returnOnEquity');

      expect(result.liquidity).toHaveProperty('currentRatio');
      expect(result.liquidity).toHaveProperty('quickRatio');
      expect(result.liquidity).toHaveProperty('cashRatio');

      expect(result.leverage).toHaveProperty('debtToEquity');
      expect(result.leverage).toHaveProperty('debtToAssets');
      expect(result.leverage).toHaveProperty('interestCoverage');
    });

    it('should return financial report without details when includeDetails is false', async () => {
      // Arrange
      const query = {
        period: ReportPeriod.MONTHLY,
        includeDetails: false,
      };

      // Act
      const result = await service.getFinancialReport(mockCompanyId, query);

      // Assert
      expect(result.transactions).toBeUndefined();
    });
  });

  describe('getFinancialAnalytics', () => {
    it('should return financial analytics with trends and forecasts', async () => {
      // Arrange
      const query = {
        period: ReportPeriod.MONTHLY,
      };

      // Act
      const result = await service.getFinancialAnalytics(mockCompanyId, query);

      // Assert
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('seasonality');
      expect(result).toHaveProperty('forecasts');
      expect(result).toHaveProperty('costAnalysis');

      expect(result.trends).toHaveProperty('revenueGrowth');
      expect(result.trends).toHaveProperty('profitGrowth');
      expect(result.trends).toHaveProperty('expenseGrowth');
      expect(result.trends).toHaveProperty('marginTrends');

      expect(result.seasonality).toHaveProperty('revenueByMonth');
      expect(result.seasonality).toHaveProperty('expenseByMonth');

      expect(result.forecasts).toHaveProperty('nextMonthRevenue');
      expect(result.forecasts).toHaveProperty('nextQuarterRevenue');
      expect(result.forecasts).toHaveProperty('nextYearRevenue');
      expect(result.forecasts).toHaveProperty('confidence');

      expect(result.costAnalysis).toHaveProperty('costByCategory');
      expect(result.costAnalysis).toHaveProperty('costEfficiency');
    });
  });

  describe('exportReport', () => {
    it('should export sales report in JSON format', async () => {
      // Arrange
      const reportType = ReportType.SALES;
      const query = { period: ReportPeriod.MONTHLY };
      const format = ReportFormat.JSON;

      // Act
      const result = await service.exportReport(mockCompanyId, reportType, query, format);

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('mimeType');

      expect(result.filename).toContain('sales_report');
      expect(result.filename).toContain('.json');
      expect(result.mimeType).toBe('application/json');
    });

    it('should export inventory report in PDF format', async () => {
      // Arrange
      const reportType = ReportType.INVENTORY;
      const query = {};
      const format = ReportFormat.PDF;

      // Act
      const result = await service.exportReport(mockCompanyId, reportType, query, format);

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('mimeType');

      expect(result.filename).toContain('inventory_report');
      expect(result.filename).toContain('.pdf');
      expect(result.mimeType).toBe('application/pdf');
    });

    it('should export financial report in Excel format', async () => {
      // Arrange
      const reportType = ReportType.FINANCIAL;
      const query = { period: ReportPeriod.QUARTERLY };
      const format = ReportFormat.EXCEL;

      // Act
      const result = await service.exportReport(mockCompanyId, reportType, query, format);

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('mimeType');

      expect(result.filename).toContain('financial_report');
      expect(result.filename).toContain('.excel');
      expect(result.mimeType).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('should export sales report in CSV format', async () => {
      // Arrange
      const reportType = ReportType.SALES;
      const query = { period: ReportPeriod.YEARLY };
      const format = ReportFormat.CSV;

      // Act
      const result = await service.exportReport(mockCompanyId, reportType, query, format);

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('mimeType');

      expect(result.filename).toContain('sales_report');
      expect(result.filename).toContain('.csv');
      expect(result.mimeType).toBe('text/csv');
    });

    it('should throw BadRequestException for unsupported report type', async () => {
      // Arrange
      const reportType = 'UNSUPPORTED' as ReportType;
      const query = {};
      const format = ReportFormat.JSON;

      // Act & Assert
      await expect(service.exportReport(mockCompanyId, reportType, query, format))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getDateRangeFromQuery', () => {
    it('should return correct date range for DAILY period', async () => {
      // Arrange
      const query = { period: ReportPeriod.DAILY };

      // Act
      const result = await service.getSalesReport(mockCompanyId, query);

      // Assert
      expect(result.period.label).toBe('Diário');
    });

    it('should return correct date range for WEEKLY period', async () => {
      // Arrange
      const query = { period: ReportPeriod.WEEKLY };

      // Act
      const result = await service.getSalesReport(mockCompanyId, query);

      // Assert
      expect(result.period.label).toBe('Semanal');
    });

    it('should return correct date range for MONTHLY period', async () => {
      // Arrange
      const query = { period: ReportPeriod.MONTHLY };

      // Act
      const result = await service.getSalesReport(mockCompanyId, query);

      // Assert
      expect(result.period.label).toBe('Mensal');
    });

    it('should return correct date range for QUARTERLY period', async () => {
      // Arrange
      const query = { period: ReportPeriod.QUARTERLY };

      // Act
      const result = await service.getSalesReport(mockCompanyId, query);

      // Assert
      expect(result.period.label).toBe('Trimestral');
    });

    it('should return correct date range for YEARLY period', async () => {
      // Arrange
      const query = { period: ReportPeriod.YEARLY };

      // Act
      const result = await service.getSalesReport(mockCompanyId, query);

      // Assert
      expect(result.period.label).toBe('Anual');
    });

    it('should return correct date range for CUSTOM period with dates', async () => {
      // Arrange
      const query = {
        period: ReportPeriod.CUSTOM,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      // Act
      const result = await service.getSalesReport(mockCompanyId, query);

      // Assert
      expect(result.period.label).toBe('Personalizado');
      expect(result.period.start).toBe('2024-01-01T00:00:00.000Z');
      expect(result.period.end).toBe('2024-01-31T00:00:00.000Z');
    });
  });
});
