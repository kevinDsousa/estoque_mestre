/**
 * Dashboard View Models
 */

import { z } from 'zod';

// Dashboard Overview
export const DashboardOverviewSchema = z.object({
  totalProducts: z.number(),
  totalCategories: z.number(),
  totalSuppliers: z.number(),
  totalCustomers: z.number(),
  totalTransactions: z.number(),
  totalRevenue: z.number(),
  totalCost: z.number(),
  totalProfit: z.number(),
  lowStockProducts: z.number(),
  outOfStockProducts: z.number(),
  pendingTransactions: z.number(),
  overduePayments: z.number(),
});

export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;

// Recent Activity
export const RecentActivitySchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['PRODUCT_CREATED', 'PRODUCT_UPDATED', 'TRANSACTION_CREATED', 'USER_LOGIN', 'INVENTORY_ADJUSTMENT']),
  description: z.string(),
  userId: z.string().uuid(),
  userName: z.string(),
  entityId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  createdAt: z.date(),
});

export type RecentActivity = z.infer<typeof RecentActivitySchema>;

// Sales Chart Data
export const SalesChartDataSchema = z.object({
  period: z.string(), // 'day', 'week', 'month', 'year'
  data: z.array(z.object({
    date: z.string(),
    sales: z.number(),
    profit: z.number(),
    transactions: z.number(),
  })),
});

export type SalesChartData = z.infer<typeof SalesChartDataSchema>;

// Top Products
export const TopProductSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  sku: z.string(),
  totalSold: z.number(),
  totalRevenue: z.number(),
  profit: z.number(),
  image: z.string().url().optional(),
});

export type TopProduct = z.infer<typeof TopProductSchema>;

// Top Customers
export const TopCustomerSchema = z.object({
  customerId: z.string().uuid(),
  customerName: z.string(),
  totalPurchases: z.number(),
  totalSpent: z.number(),
  lastPurchaseAt: z.date().optional(),
  isVip: z.boolean(),
});

export type TopCustomer = z.infer<typeof TopCustomerSchema>;

// Inventory Alerts
export const InventoryAlertSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  sku: z.string(),
  currentStock: z.number(),
  minStock: z.number(),
  status: z.enum(['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED', 'EXPIRING_SOON']),
  daysUntilExpiration: z.number().optional(),
  lastRestockedAt: z.date().optional(),
});

export type InventoryAlert = z.infer<typeof InventoryAlertSchema>;

// Dashboard View
export const DashboardViewSchema = z.object({
  overview: DashboardOverviewSchema,
  recentActivities: z.array(RecentActivitySchema),
  salesChart: SalesChartDataSchema,
  topProducts: z.array(TopProductSchema),
  topCustomers: z.array(TopCustomerSchema),
  inventoryAlerts: z.array(InventoryAlertSchema),
});

export type DashboardView = z.infer<typeof DashboardViewSchema>;

// ==============================================
// VERSÕES EM PORTUGUÊS PARA APRESENTAÇÃO
// ==============================================

// Visão Geral do Dashboard em Português
export const DashboardOverviewPortugueseSchema = z.object({
  totalProdutos: z.number(),
  totalCategorias: z.number(),
  totalFornecedores: z.number(),
  totalClientes: z.number(),
  totalTransacoes: z.number(),
  receitaTotal: z.number(),
  custoTotal: z.number(),
  lucroTotal: z.number(),
  produtosEstoqueBaixo: z.number(),
  produtosSemEstoque: z.number(),
  transacoesPendentes: z.number(),
  pagamentosVencidos: z.number(),
});

export type DashboardOverviewPortuguese = z.infer<typeof DashboardOverviewPortugueseSchema>;

// Atividade Recente em Português
export const RecentActivityPortugueseSchema = z.object({
  id: z.string().uuid(),
  tipo: z.enum(['PRODUTO_CRIADO', 'PRODUTO_ATUALIZADO', 'TRANSACAO_CRIADA', 'USUARIO_LOGIN', 'AJUSTE_ESTOQUE']),
  descricao: z.string(),
  idUsuario: z.string().uuid(),
  nomeUsuario: z.string(),
  idEntidade: z.string().uuid().optional(),
  tipoEntidade: z.string().optional(),
  dataCriacao: z.date(),
});

export type RecentActivityPortuguese = z.infer<typeof RecentActivityPortugueseSchema>;

// Dados do Gráfico de Vendas em Português
export const SalesChartDataPortugueseSchema = z.object({
  periodo: z.string(), // 'dia', 'semana', 'mes', 'ano'
  dados: z.array(z.object({
    data: z.string(),
    vendas: z.number(),
    lucro: z.number(),
    transacoes: z.number(),
  })),
});

export type SalesChartDataPortuguese = z.infer<typeof SalesChartDataPortugueseSchema>;

// Top Produtos em Português
export const TopProductPortugueseSchema = z.object({
  idProduto: z.string().uuid(),
  nomeProduto: z.string(),
  codigo: z.string(),
  totalVendido: z.number(),
  receitaTotal: z.number(),
  lucro: z.number(),
  imagem: z.string().url().optional(),
});

export type TopProductPortuguese = z.infer<typeof TopProductPortugueseSchema>;

// Top Clientes em Português
export const TopCustomerPortugueseSchema = z.object({
  idCliente: z.string().uuid(),
  nomeCliente: z.string(),
  totalCompras: z.number(),
  totalGasto: z.number(),
  ultimaCompraEm: z.date().optional(),
  eVip: z.boolean(),
});

export type TopCustomerPortuguese = z.infer<typeof TopCustomerPortugueseSchema>;

// Alertas de Estoque em Português
export const InventoryAlertPortugueseSchema = z.object({
  idProduto: z.string().uuid(),
  nomeProduto: z.string(),
  codigo: z.string(),
  estoqueAtual: z.number(),
  estoqueMinimo: z.number(),
  status: z.enum(['ESTOQUE_BAIXO', 'SEM_ESTOQUE', 'VENCIDO', 'VENCENDO_EM_BREVE']),
  diasAteVencimento: z.number().optional(),
  ultimoReabastecimentoEm: z.date().optional(),
});

export type InventoryAlertPortuguese = z.infer<typeof InventoryAlertPortugueseSchema>;

// Dashboard View em Português
export const DashboardViewPortugueseSchema = z.object({
  visaoGeral: DashboardOverviewPortugueseSchema,
  atividadesRecentes: z.array(RecentActivityPortugueseSchema),
  graficovendas: SalesChartDataPortugueseSchema,
  topProdutos: z.array(TopProductPortugueseSchema),
  topClientes: z.array(TopCustomerPortugueseSchema),
  alertasEstoque: z.array(InventoryAlertPortugueseSchema),
});

export type DashboardViewPortuguese = z.infer<typeof DashboardViewPortugueseSchema>;
