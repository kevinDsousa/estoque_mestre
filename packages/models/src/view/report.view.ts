/**
 * Report View Models
 */

import { z } from 'zod';

// Sales Report
export const SalesReportSchema = z.object({
  period: z.object({
    startDate: z.date(),
    endDate: z.date(),
    type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']),
  }),
  summary: z.object({
    totalSales: z.number(),
    totalTransactions: z.number(),
    averageTransactionValue: z.number(),
    totalProfit: z.number(),
    profitMargin: z.number(),
  }),
  data: z.array(z.object({
    date: z.string(),
    sales: z.number(),
    transactions: z.number(),
    profit: z.number(),
    cost: z.number(),
  })),
  topProducts: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    sku: z.string(),
    quantitySold: z.number(),
    revenue: z.number(),
    profit: z.number(),
  })),
  topCustomers: z.array(z.object({
    customerId: z.string().uuid(),
    customerName: z.string(),
    totalSpent: z.number(),
    transactions: z.number(),
  })),
});

export type SalesReport = z.infer<typeof SalesReportSchema>;

// Inventory Report
export const InventoryReportSchema = z.object({
  summary: z.object({
    totalProducts: z.number(),
    totalValue: z.number(),
    totalCost: z.number(),
    lowStockProducts: z.number(),
    outOfStockProducts: z.number(),
    expiredProducts: z.number(),
  }),
  categories: z.array(z.object({
    categoryId: z.string().uuid(),
    categoryName: z.string(),
    productCount: z.number(),
    totalValue: z.number(),
    totalCost: z.number(),
    lowStockCount: z.number(),
  })),
  suppliers: z.array(z.object({
    supplierId: z.string().uuid(),
    supplierName: z.string(),
    productCount: z.number(),
    totalValue: z.number(),
    averageRating: z.number(),
  })),
  movements: z.array(z.object({
    date: z.string(),
    inMovements: z.number(),
    outMovements: z.number(),
    adjustments: z.number(),
    netChange: z.number(),
  })),
});

export type InventoryReport = z.infer<typeof InventoryReportSchema>;

// Financial Report
export const FinancialReportSchema = z.object({
  period: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  revenue: z.object({
    total: z.number(),
    sales: z.number(),
    other: z.number(),
  }),
  costs: z.object({
    total: z.number(),
    purchases: z.number(),
    operating: z.number(),
    other: z.number(),
  }),
  profit: z.object({
    gross: z.number(),
    net: z.number(),
    margin: z.number(),
  }),
  cashFlow: z.array(z.object({
    date: z.string(),
    inflow: z.number(),
    outflow: z.number(),
    balance: z.number(),
  })),
  accountsReceivable: z.object({
    total: z.number(),
    current: z.number(),
    overdue: z.number(),
    overdue30Days: z.number(),
    overdue60Days: z.number(),
    overdue90Days: z.number(),
  }),
  accountsPayable: z.object({
    total: z.number(),
    current: z.number(),
    overdue: z.number(),
  }),
});

export type FinancialReport = z.infer<typeof FinancialReportSchema>;

// Customer Report
export const CustomerReportSchema = z.object({
  summary: z.object({
    totalCustomers: z.number(),
    activeCustomers: z.number(),
    newCustomers: z.number(),
    vipCustomers: z.number(),
    totalRevenue: z.number(),
    averageCustomerValue: z.number(),
  }),
  customerTypes: z.array(z.object({
    type: z.enum(['INDIVIDUAL', 'BUSINESS', 'WHOLESALE']),
    count: z.number(),
    percentage: z.number(),
    totalRevenue: z.number(),
  })),
  topCustomers: z.array(z.object({
    customerId: z.string().uuid(),
    customerName: z.string(),
    type: z.enum(['INDIVIDUAL', 'BUSINESS', 'WHOLESALE']),
    totalSpent: z.number(),
    transactions: z.number(),
    lastPurchaseAt: z.date().optional(),
    isVip: z.boolean(),
  })),
  customerAcquisition: z.array(z.object({
    date: z.string(),
    newCustomers: z.number(),
    totalCustomers: z.number(),
  })),
});

export type CustomerReport = z.infer<typeof CustomerReportSchema>;

// Supplier Report
export const SupplierReportSchema = z.object({
  summary: z.object({
    totalSuppliers: z.number(),
    activeSuppliers: z.number(),
    preferredSuppliers: z.number(),
    totalPurchases: z.number(),
    averageRating: z.number(),
  }),
  supplierTypes: z.array(z.object({
    type: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER']),
    count: z.number(),
    percentage: z.number(),
    totalPurchases: z.number(),
  })),
  topSuppliers: z.array(z.object({
    supplierId: z.string().uuid(),
    supplierName: z.string(),
    type: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER']),
    totalPurchases: z.number(),
    productCount: z.number(),
    averageRating: z.number(),
    isPreferred: z.boolean(),
  })),
  supplierPerformance: z.array(z.object({
    supplierId: z.string().uuid(),
    supplierName: z.string(),
    quality: z.number(),
    delivery: z.number(),
    communication: z.number(),
    price: z.number(),
    overall: z.number(),
  })),
});

export type SupplierReport = z.infer<typeof SupplierReportSchema>;

// Report Filters
export const ReportFiltersSchema = z.object({
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  supplierIds: z.array(z.string().uuid()).optional(),
  customerIds: z.array(z.string().uuid()).optional(),
  productIds: z.array(z.string().uuid()).optional(),
  status: z.array(z.string()).optional(),
  groupBy: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR', 'CATEGORY', 'SUPPLIER', 'CUSTOMER']).optional(),
});

export type ReportFilters = z.infer<typeof ReportFiltersSchema>;

// ==============================================
// VERSÕES EM PORTUGUÊS PARA APRESENTAÇÃO
// ==============================================

// Relatório de Vendas em Português
export const SalesReportPortugueseSchema = z.object({
  periodo: z.object({
    dataInicio: z.date(),
    dataFim: z.date(),
    tipo: z.enum(['DIARIO', 'SEMANAL', 'MENSAL', 'ANUAL', 'PERSONALIZADO']),
  }),
  resumo: z.object({
    vendasTotais: z.number(),
    totalTransacoes: z.number(),
    valorMedioTransacao: z.number(),
    lucroTotal: z.number(),
    margemLucro: z.number(),
  }),
  dados: z.array(z.object({
    data: z.string(),
    vendas: z.number(),
    transacoes: z.number(),
    lucro: z.number(),
    custo: z.number(),
  })),
  topProdutos: z.array(z.object({
    idProduto: z.string().uuid(),
    nomeProduto: z.string(),
    codigo: z.string(),
    quantidadeVendida: z.number(),
    receita: z.number(),
    lucro: z.number(),
  })),
  topClientes: z.array(z.object({
    idCliente: z.string().uuid(),
    nomeCliente: z.string(),
    totalGasto: z.number(),
    transacoes: z.number(),
  })),
});

export type SalesReportPortuguese = z.infer<typeof SalesReportPortugueseSchema>;

// Relatório de Estoque em Português
export const InventoryReportPortugueseSchema = z.object({
  resumo: z.object({
    totalProdutos: z.number(),
    valorTotal: z.number(),
    custoTotal: z.number(),
    produtosEstoqueBaixo: z.number(),
    produtosSemEstoque: z.number(),
    produtosVencidos: z.number(),
  }),
  categorias: z.array(z.object({
    idCategoria: z.string().uuid(),
    nomeCategoria: z.string(),
    quantidadeProdutos: z.number(),
    valorTotal: z.number(),
    custoTotal: z.number(),
    quantidadeEstoqueBaixo: z.number(),
  })),
  fornecedores: z.array(z.object({
    idFornecedor: z.string().uuid(),
    nomeFornecedor: z.string(),
    quantidadeProdutos: z.number(),
    valorTotal: z.number(),
    avaliacaoMedia: z.number(),
  })),
  movimentacoes: z.array(z.object({
    data: z.string(),
    movimentacoesEntrada: z.number(),
    movimentacoesSaida: z.number(),
    ajustes: z.number(),
    mudancaLiquida: z.number(),
  })),
});

export type InventoryReportPortuguese = z.infer<typeof InventoryReportPortugueseSchema>;

// Relatório Financeiro em Português
export const FinancialReportPortugueseSchema = z.object({
  periodo: z.object({
    dataInicio: z.date(),
    dataFim: z.date(),
  }),
  receita: z.object({
    total: z.number(),
    vendas: z.number(),
    outros: z.number(),
  }),
  custos: z.object({
    total: z.number(),
    compras: z.number(),
    operacionais: z.number(),
    outros: z.number(),
  }),
  lucro: z.object({
    bruto: z.number(),
    liquido: z.number(),
    margem: z.number(),
  }),
  fluxoCaixa: z.array(z.object({
    data: z.string(),
    entrada: z.number(),
    saida: z.number(),
    saldo: z.number(),
  })),
  contasReceber: z.object({
    total: z.number(),
    atuais: z.number(),
    vencidas: z.number(),
    vencidas30Dias: z.number(),
    vencidas60Dias: z.number(),
    vencidas90Dias: z.number(),
  }),
  contasPagar: z.object({
    total: z.number(),
    atuais: z.number(),
    vencidas: z.number(),
  }),
});

export type FinancialReportPortuguese = z.infer<typeof FinancialReportPortugueseSchema>;

// Relatório de Clientes em Português
export const CustomerReportPortugueseSchema = z.object({
  resumo: z.object({
    totalClientes: z.number(),
    clientesAtivos: z.number(),
    novosClientes: z.number(),
    clientesVip: z.number(),
    receitaTotal: z.number(),
    valorMedioCliente: z.number(),
  }),
  tiposCliente: z.array(z.object({
    tipo: z.enum(['PESSOA_FISICA', 'PESSOA_JURIDICA', 'ATACADO']),
    quantidade: z.number(),
    percentual: z.number(),
    receitaTotal: z.number(),
  })),
  topClientes: z.array(z.object({
    idCliente: z.string().uuid(),
    nomeCliente: z.string(),
    tipo: z.enum(['PESSOA_FISICA', 'PESSOA_JURIDICA', 'ATACADO']),
    totalGasto: z.number(),
    transacoes: z.number(),
    ultimaCompraEm: z.date().optional(),
    eVip: z.boolean(),
  })),
  aquisicaoClientes: z.array(z.object({
    data: z.string(),
    novosClientes: z.number(),
    totalClientes: z.number(),
  })),
});

export type CustomerReportPortuguese = z.infer<typeof CustomerReportPortugueseSchema>;

// Relatório de Fornecedores em Português
export const SupplierReportPortugueseSchema = z.object({
  resumo: z.object({
    totalFornecedores: z.number(),
    fornecedoresAtivos: z.number(),
    fornecedoresPreferenciais: z.number(),
    totalCompras: z.number(),
    avaliacaoMedia: z.number(),
  }),
  tiposFornecedor: z.array(z.object({
    tipo: z.enum(['FABRICANTE', 'DISTRIBUIDOR', 'ATACADISTA', 'VAREJISTA']),
    quantidade: z.number(),
    percentual: z.number(),
    totalCompras: z.number(),
  })),
  topFornecedores: z.array(z.object({
    idFornecedor: z.string().uuid(),
    nomeFornecedor: z.string(),
    tipo: z.enum(['FABRICANTE', 'DISTRIBUIDOR', 'ATACADISTA', 'VAREJISTA']),
    totalCompras: z.number(),
    quantidadeProdutos: z.number(),
    avaliacaoMedia: z.number(),
    ePreferencial: z.boolean(),
  })),
  desempenhoFornecedores: z.array(z.object({
    idFornecedor: z.string().uuid(),
    nomeFornecedor: z.string(),
    qualidade: z.number(),
    entrega: z.number(),
    comunicacao: z.number(),
    preco: z.number(),
    geral: z.number(),
  })),
});

export type SupplierReportPortuguese = z.infer<typeof SupplierReportPortugueseSchema>;

// Filtros de Relatório em Português
export const ReportFiltersPortugueseSchema = z.object({
  periodo: z.object({
    dataInicio: z.date(),
    dataFim: z.date(),
  }).optional(),
  idsCategorias: z.array(z.string().uuid()).optional(),
  idsFornecedores: z.array(z.string().uuid()).optional(),
  idsClientes: z.array(z.string().uuid()).optional(),
  idsProdutos: z.array(z.string().uuid()).optional(),
  status: z.array(z.string()).optional(),
  agruparPor: z.enum(['DIA', 'SEMANA', 'MES', 'ANO', 'CATEGORIA', 'FORNECEDOR', 'CLIENTE']).optional(),
});

export type ReportFiltersPortuguese = z.infer<typeof ReportFiltersPortugueseSchema>;
