import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
  ParseEnumPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportQueryDto, ReportType, ReportFormat, ReportPeriod } from './dto/report-query.dto';
import { SalesReportDto, SalesAnalyticsDto } from './dto/sales-report.dto';
import { InventoryReportDto, InventoryAnalyticsDto } from './dto/inventory-report.dto';
import { FinancialReportDto, FinancialAnalyticsDto } from './dto/financial-report.dto';
import { DashboardDto, DashboardQueryDto } from './dto/dashboard.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../../common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { AuthContext } from '../../common/decorators/auth-context.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ===== DASHBOARD =====

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard data with metrics and charts' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully', type: DashboardDto })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'quarter', 'year'], description: 'Dashboard period' })
  @ApiQuery({ name: 'includeCharts', required: false, type: Boolean, description: 'Include charts in response' })
  @ApiQuery({ name: 'includeAlerts', required: false, type: Boolean, description: 'Include alerts in response' })
  @ApiQuery({ name: 'includeActivities', required: false, type: Boolean, description: 'Include recent activities in response' })
  async getDashboard(
    @AuthContext() authContext: any,
    @Query('period', new DefaultValuePipe('month')) period: 'today' | 'week' | 'month' | 'quarter' | 'year',
    @Query('includeCharts', new DefaultValuePipe(true)) includeCharts: boolean,
    @Query('includeAlerts', new DefaultValuePipe(true)) includeAlerts: boolean,
    @Query('includeActivities', new DefaultValuePipe(true)) includeActivities: boolean,
  ): Promise<DashboardDto> {
    const query: DashboardQueryDto = {
      period,
      includeCharts,
      includeAlerts,
      includeActivities,
    };

    return this.reportsService.getDashboard(authContext.companyId, query);
  }

  // ===== SALES REPORTS =====

  @Get('sales')
  @ApiOperation({ summary: 'Get sales report' })
  @ApiResponse({ status: 200, description: 'Sales report retrieved successfully', type: SalesReportDto })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'], description: 'Report period' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category' })
  @ApiQuery({ name: 'customerId', required: false, type: String, description: 'Filter by customer' })
  @ApiQuery({ name: 'includeDetails', required: false, type: Boolean, description: 'Include transaction details' })
  async getSalesReport(
    @AuthContext() authContext: any,
    @Query() query: ReportQueryDto,
  ): Promise<SalesReportDto> {
    return this.reportsService.getSalesReport(authContext.companyId, query);
  }

  @Get('sales/analytics')
  @ApiOperation({ summary: 'Get sales analytics with trends and forecasts' })
  @ApiResponse({ status: 200, description: 'Sales analytics retrieved successfully', type: SalesAnalyticsDto })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'], description: 'Report period' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
  async getSalesAnalytics(
    @AuthContext() authContext: any,
    @Query() query: ReportQueryDto,
  ): Promise<SalesAnalyticsDto> {
    return this.reportsService.getSalesAnalytics(authContext.companyId, query);
  }

  // ===== INVENTORY REPORTS =====

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report' })
  @ApiResponse({ status: 200, description: 'Inventory report retrieved successfully', type: InventoryReportDto })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'], description: 'Report period' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category' })
  @ApiQuery({ name: 'includeDetails', required: false, type: Boolean, description: 'Include movement details' })
  async getInventoryReport(
    @AuthContext() authContext: any,
    @Query() query: ReportQueryDto,
  ): Promise<InventoryReportDto> {
    return this.reportsService.getInventoryReport(authContext.companyId, query);
  }

  @Get('inventory/analytics')
  @ApiOperation({ summary: 'Get inventory analytics with efficiency metrics' })
  @ApiResponse({ status: 200, description: 'Inventory analytics retrieved successfully', type: InventoryAnalyticsDto })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'], description: 'Report period' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
  async getInventoryAnalytics(
    @AuthContext() authContext: any,
    @Query() query: ReportQueryDto,
  ): Promise<InventoryAnalyticsDto> {
    return this.reportsService.getInventoryAnalytics(authContext.companyId, query);
  }

  // ===== FINANCIAL REPORTS =====

  @Get('financial')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get financial report (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Financial report retrieved successfully', type: FinancialReportDto })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'], description: 'Report period' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
  @ApiQuery({ name: 'includeDetails', required: false, type: Boolean, description: 'Include transaction details' })
  async getFinancialReport(
    @AuthContext() authContext: any,
    @Query() query: ReportQueryDto,
  ): Promise<FinancialReportDto> {
    return this.reportsService.getFinancialReport(authContext.companyId, query);
  }

  @Get('financial/analytics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get financial analytics with trends and forecasts (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Financial analytics retrieved successfully', type: FinancialAnalyticsDto })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'], description: 'Report period' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
  async getFinancialAnalytics(
    @AuthContext() authContext: any,
    @Query() query: ReportQueryDto,
  ): Promise<FinancialAnalyticsDto> {
    return this.reportsService.getFinancialAnalytics(authContext.companyId, query);
  }

  // ===== EXPORT FUNCTIONALITY =====

  @Post('export')
  @ApiOperation({ summary: 'Export report in various formats' })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid export parameters' })
  async exportReport(
    @AuthContext() authContext: any,
    @Body() body: {
      reportType: ReportType;
      query: ReportQueryDto;
      format: ReportFormat;
    },
    @Res() res: Response,
  ) {
    const { reportType, query, format } = body;
    
    const exportResult = await this.reportsService.exportReport(
      authContext.companyId,
      reportType,
      query,
      format,
    );

    // Set appropriate headers based on format
    res.setHeader('Content-Type', exportResult.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);

    // In a real implementation, you would stream the actual file content
    // For now, we'll return the data as JSON
    if (format === ReportFormat.JSON) {
      return res.json(exportResult.data);
    }

    // For other formats, you would generate the actual file and stream it
    // This is a placeholder implementation
    return res.json({
      message: `Report exported as ${format}`,
      filename: exportResult.filename,
      data: exportResult.data,
    });
  }

  // ===== QUICK REPORTS =====

  @Get('quick/sales-summary')
  @ApiOperation({ summary: 'Get quick sales summary' })
  @ApiResponse({ status: 200, description: 'Sales summary retrieved successfully' })
  async getQuickSalesSummary(@AuthContext() authContext: any) {
    const query: ReportQueryDto = { period: ReportPeriod.MONTHLY };
    const report = await this.reportsService.getSalesReport(authContext.companyId, query);
    return {
      totalRevenue: report.summary.totalRevenue,
      totalOrders: report.summary.totalOrders,
      averageOrderValue: report.summary.averageOrderValue,
      period: report.period,
    };
  }

  @Get('quick/inventory-summary')
  @ApiOperation({ summary: 'Get quick inventory summary' })
  @ApiResponse({ status: 200, description: 'Inventory summary retrieved successfully' })
  async getQuickInventorySummary(@AuthContext() authContext: any) {
    const query: ReportQueryDto = {};
    const report = await this.reportsService.getInventoryReport(authContext.companyId, query);
    return {
      totalProducts: report.summary.totalProducts,
      totalValue: report.summary.totalValue,
      lowStockItems: report.summary.lowStockItems,
      outOfStockItems: report.summary.outOfStockItems,
    };
  }

  @Get('quick/financial-summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get quick financial summary (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Financial summary retrieved successfully' })
  async getQuickFinancialSummary(@AuthContext() authContext: any) {
    const query: ReportQueryDto = { period: ReportPeriod.MONTHLY };
    const report = await this.reportsService.getFinancialReport(authContext.companyId, query);
    return {
      revenue: report.incomeStatement.revenue.netSales,
      profit: report.incomeStatement.netIncome,
      expenses: report.incomeStatement.operatingExpenses.total,
      period: report.period,
    };
  }

  // ===== CUSTOM REPORTS =====

  @Post('custom')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create custom report with specific parameters' })
  @ApiResponse({ status: 200, description: 'Custom report generated successfully' })
  async createCustomReport(
    @AuthContext() authContext: any,
    @Body() body: {
      name: string;
      description?: string;
      reportType: ReportType;
      query: ReportQueryDto;
      schedule?: {
        frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
        time: string; // HH:MM format
        recipients: string[]; // Email addresses
      };
    },
  ) {
    // In a real implementation, you would:
    // 1. Save the custom report configuration
    // 2. Set up scheduled generation if requested
    // 3. Send to recipients if scheduled

    const report = await this.reportsService.getSalesReport(authContext.companyId, body.query);

    return {
      message: 'Custom report created successfully',
      reportId: 'custom_' + Date.now(),
      name: body.name,
      report,
    };
  }

  // ===== REPORT TEMPLATES =====

  @Get('templates')
  @ApiOperation({ summary: 'Get available report templates' })
  @ApiResponse({ status: 200, description: 'Report templates retrieved successfully' })
  async getReportTemplates() {
    return {
      templates: [
        {
          id: 'sales_monthly',
          name: 'Relatório de Vendas Mensal',
          description: 'Relatório completo de vendas do mês',
          type: ReportType.SALES,
          defaultQuery: {
            period: 'MONTHLY',
            includeDetails: true,
            includeCharts: true,
          },
        },
        {
          id: 'inventory_abc',
          name: 'Análise ABC do Estoque',
          description: 'Análise ABC dos produtos em estoque',
          type: ReportType.INVENTORY,
          defaultQuery: {
            includeDetails: true,
          },
        },
        {
          id: 'financial_quarterly',
          name: 'Relatório Financeiro Trimestral',
          description: 'Demonstrativo de resultados trimestral',
          type: ReportType.FINANCIAL,
          defaultQuery: {
            period: 'QUARTERLY',
            includeDetails: true,
          },
        },
        {
          id: 'dashboard_executive',
          name: 'Dashboard Executivo',
          description: 'Visão geral para executivos',
          type: 'DASHBOARD' as any,
          defaultQuery: {
            period: 'month',
            includeCharts: true,
            includeAlerts: true,
            includeActivities: true,
          },
        },
      ],
    };
  }
}
