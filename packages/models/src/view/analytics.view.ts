/**
 * Analytics View Models
 */

import { z } from 'zod';

// Performance Metrics
export const PerformanceMetricsSchema = z.object({
  period: z.object({
    startDate: z.date(),
    endDate: z.date(),
    type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  }),
  sales: z.object({
    total: z.number(),
    growth: z.number(), // percentage
    average: z.number(),
    trend: z.enum(['UP', 'DOWN', 'STABLE']),
  }),
  profit: z.object({
    total: z.number(),
    margin: z.number(),
    growth: z.number(), // percentage
    trend: z.enum(['UP', 'DOWN', 'STABLE']),
  }),
  inventory: z.object({
    turnover: z.number(),
    value: z.number(),
    efficiency: z.number(), // percentage
    trend: z.enum(['UP', 'DOWN', 'STABLE']),
  }),
  customers: z.object({
    total: z.number(),
    active: z.number(),
    new: z.number(),
    retention: z.number(), // percentage
    trend: z.enum(['UP', 'DOWN', 'STABLE']),
  }),
});

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

// Trend Analysis
export const TrendAnalysisSchema = z.object({
  metric: z.string(),
  period: z.string(),
  data: z.array(z.object({
    date: z.string(),
    value: z.number(),
    change: z.number(), // percentage change from previous period
  })),
  trend: z.enum(['INCREASING', 'DECREASING', 'STABLE', 'VOLATILE']),
  forecast: z.array(z.object({
    date: z.string(),
    predictedValue: z.number(),
    confidence: z.number(), // 0-1
  })).optional(),
});

export type TrendAnalysis = z.infer<typeof TrendAnalysisSchema>;

// Comparative Analysis
export const ComparativeAnalysisSchema = z.object({
  currentPeriod: z.object({
    startDate: z.date(),
    endDate: z.date(),
    metrics: z.record(z.number()),
  }),
  previousPeriod: z.object({
    startDate: z.date(),
    endDate: z.date(),
    metrics: z.record(z.number()),
  }),
  changes: z.record(z.object({
    value: z.number(),
    percentage: z.number(),
    trend: z.enum(['UP', 'DOWN', 'STABLE']),
  })),
});

export type ComparativeAnalysis = z.infer<typeof ComparativeAnalysisSchema>;

// Market Analysis
export const MarketAnalysisSchema = z.object({
  categoryPerformance: z.array(z.object({
    categoryId: z.string().uuid(),
    categoryName: z.string(),
    marketShare: z.number(), // percentage
    growth: z.number(), // percentage
    revenue: z.number(),
    profit: z.number(),
    trend: z.enum(['UP', 'DOWN', 'STABLE']),
  })),
  seasonalPatterns: z.array(z.object({
    month: z.number(),
    sales: z.number(),
    profit: z.number(),
    transactions: z.number(),
  })),
  competitivePosition: z.object({
    marketPosition: z.enum(['LEADER', 'CHALLENGER', 'FOLLOWER', 'NICHE']),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
  }),
});

export type MarketAnalysis = z.infer<typeof MarketAnalysisSchema>;

// Customer Analytics
export const CustomerAnalyticsSchema = z.object({
  segmentation: z.array(z.object({
    segment: z.string(),
    count: z.number(),
    percentage: z.number(),
    averageValue: z.number(),
    retention: z.number(),
  })),
  lifetimeValue: z.object({
    average: z.number(),
    distribution: z.array(z.object({
      range: z.string(),
      count: z.number(),
      percentage: z.number(),
    })),
  }),
  behavior: z.object({
    averagePurchaseFrequency: z.number(),
    averagePurchaseValue: z.number(),
    churnRate: z.number(),
    repeatPurchaseRate: z.number(),
  }),
  acquisition: z.object({
    cost: z.number(),
    channels: z.array(z.object({
      channel: z.string(),
      customers: z.number(),
      cost: z.number(),
      conversion: z.number(),
    })),
  }),
});

export type CustomerAnalytics = z.infer<typeof CustomerAnalyticsSchema>;

// Product Analytics
export const ProductAnalyticsSchema = z.object({
  performance: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    sku: z.string(),
    category: z.string(),
    sales: z.number(),
    profit: z.number(),
    margin: z.number(),
    inventoryTurnover: z.number(),
    demand: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  })),
  lifecycle: z.array(z.object({
    stage: z.enum(['INTRODUCTION', 'GROWTH', 'MATURITY', 'DECLINE']),
    products: z.number(),
    revenue: z.number(),
    profit: z.number(),
  })),
  profitability: z.object({
    topPerformers: z.array(z.string().uuid()),
    underPerformers: z.array(z.string().uuid()),
    averageMargin: z.number(),
    marginDistribution: z.array(z.object({
      range: z.string(),
      count: z.number(),
      percentage: z.number(),
    })),
  }),
});

export type ProductAnalytics = z.infer<typeof ProductAnalyticsSchema>;

// Analytics Dashboard
export const AnalyticsDashboardSchema = z.object({
  performanceMetrics: PerformanceMetricsSchema,
  salesTrend: TrendAnalysisSchema,
  profitTrend: TrendAnalysisSchema,
  inventoryTrend: TrendAnalysisSchema,
  comparativeAnalysis: ComparativeAnalysisSchema,
  marketAnalysis: MarketAnalysisSchema,
  customerAnalytics: CustomerAnalyticsSchema,
  productAnalytics: ProductAnalyticsSchema,
});

export type AnalyticsDashboard = z.infer<typeof AnalyticsDashboardSchema>;

// ==============================================
// VERSÕES EM PORTUGUÊS PARA APRESENTAÇÃO
// ==============================================

// Métricas de Performance em Português
export const PerformanceMetricsPortugueseSchema = z.object({
  periodo: z.object({
    dataInicio: z.date(),
    dataFim: z.date(),
    tipo: z.enum(['DIARIO', 'SEMANAL', 'MENSAL', 'ANUAL']),
  }),
  vendas: z.object({
    total: z.number(),
    crescimento: z.number(), // percentual
    media: z.number(),
    tendencia: z.enum(['ALTA', 'BAIXA', 'ESTAVEL']),
  }),
  lucro: z.object({
    total: z.number(),
    margem: z.number(),
    crescimento: z.number(), // percentual
    tendencia: z.enum(['ALTA', 'BAIXA', 'ESTAVEL']),
  }),
  estoque: z.object({
    giro: z.number(),
    valor: z.number(),
    eficiencia: z.number(), // percentual
    tendencia: z.enum(['ALTA', 'BAIXA', 'ESTAVEL']),
  }),
  clientes: z.object({
    total: z.number(),
    ativos: z.number(),
    novos: z.number(),
    retencao: z.number(), // percentual
    tendencia: z.enum(['ALTA', 'BAIXA', 'ESTAVEL']),
  }),
});

export type PerformanceMetricsPortuguese = z.infer<typeof PerformanceMetricsPortugueseSchema>;

// Análise de Tendências em Português
export const TrendAnalysisPortugueseSchema = z.object({
  metrica: z.string(),
  periodo: z.string(),
  dados: z.array(z.object({
    data: z.string(),
    valor: z.number(),
    mudanca: z.number(), // mudança percentual do período anterior
  })),
  tendencia: z.enum(['CRESCENTE', 'DECRESCENTE', 'ESTAVEL', 'VOLATIL']),
  previsao: z.array(z.object({
    data: z.string(),
    valorPrevisto: z.number(),
    confianca: z.number(), // 0-1
  })).optional(),
});

export type TrendAnalysisPortuguese = z.infer<typeof TrendAnalysisPortugueseSchema>;

// Análise Comparativa em Português
export const ComparativeAnalysisPortugueseSchema = z.object({
  periodoAtual: z.object({
    dataInicio: z.date(),
    dataFim: z.date(),
    metricas: z.record(z.number()),
  }),
  periodoAnterior: z.object({
    dataInicio: z.date(),
    dataFim: z.date(),
    metricas: z.record(z.number()),
  }),
  mudancas: z.record(z.object({
    valor: z.number(),
    percentual: z.number(),
    tendencia: z.enum(['ALTA', 'BAIXA', 'ESTAVEL']),
  })),
});

export type ComparativeAnalysisPortuguese = z.infer<typeof ComparativeAnalysisPortugueseSchema>;

// Análise de Mercado em Português
export const MarketAnalysisPortugueseSchema = z.object({
  desempenhoCategorias: z.array(z.object({
    idCategoria: z.string().uuid(),
    nomeCategoria: z.string(),
    participacaoMercado: z.number(), // percentual
    crescimento: z.number(), // percentual
    receita: z.number(),
    lucro: z.number(),
    tendencia: z.enum(['ALTA', 'BAIXA', 'ESTAVEL']),
  })),
  padroesSazonais: z.array(z.object({
    mes: z.number(),
    vendas: z.number(),
    lucro: z.number(),
    transacoes: z.number(),
  })),
  posicaoCompetitiva: z.object({
    posicaoMercado: z.enum(['LIDER', 'DESAFIANTE', 'SEGUIDOR', 'NICHO']),
    forcas: z.array(z.string()),
    fraquezas: z.array(z.string()),
    oportunidades: z.array(z.string()),
    ameacas: z.array(z.string()),
  }),
});

export type MarketAnalysisPortuguese = z.infer<typeof MarketAnalysisPortugueseSchema>;

// Analytics de Clientes em Português
export const CustomerAnalyticsPortugueseSchema = z.object({
  segmentacao: z.array(z.object({
    segmento: z.string(),
    quantidade: z.number(),
    percentual: z.number(),
    valorMedio: z.number(),
    retencao: z.number(),
  })),
  valorVida: z.object({
    media: z.number(),
    distribuicao: z.array(z.object({
      faixa: z.string(),
      quantidade: z.number(),
      percentual: z.number(),
    })),
  }),
  comportamento: z.object({
    frequenciaCompraMedia: z.number(),
    valorCompraMedia: z.number(),
    taxaEvasao: z.number(),
    taxaRecompra: z.number(),
  }),
  aquisicao: z.object({
    custo: z.number(),
    canais: z.array(z.object({
      canal: z.string(),
      clientes: z.number(),
      custo: z.number(),
      conversao: z.number(),
    })),
  }),
});

export type CustomerAnalyticsPortuguese = z.infer<typeof CustomerAnalyticsPortugueseSchema>;

// Analytics de Produtos em Português
export const ProductAnalyticsPortugueseSchema = z.object({
  desempenho: z.array(z.object({
    idProduto: z.string().uuid(),
    nomeProduto: z.string(),
    codigo: z.string(),
    categoria: z.string(),
    vendas: z.number(),
    lucro: z.number(),
    margem: z.number(),
    giroEstoque: z.number(),
    demanda: z.enum(['ALTA', 'MEDIA', 'BAIXA']),
  })),
  cicloVida: z.array(z.object({
    estagio: z.enum(['INTRODUCAO', 'CRESCIMENTO', 'MATURIDADE', 'DECLINIO']),
    produtos: z.number(),
    receita: z.number(),
    lucro: z.number(),
  })),
  rentabilidade: z.object({
    melhoresPerformers: z.array(z.string().uuid()),
    baixosPerformers: z.array(z.string().uuid()),
    margemMedia: z.number(),
    distribuicaoMargem: z.array(z.object({
      faixa: z.string(),
      quantidade: z.number(),
      percentual: z.number(),
    })),
  }),
});

export type ProductAnalyticsPortuguese = z.infer<typeof ProductAnalyticsPortugueseSchema>;

// Dashboard de Analytics em Português
export const AnalyticsDashboardPortugueseSchema = z.object({
  metricasPerformance: PerformanceMetricsPortugueseSchema,
  tendenciaVendas: TrendAnalysisPortugueseSchema,
  tendenciaLucro: TrendAnalysisPortugueseSchema,
  tendenciaEstoque: TrendAnalysisPortugueseSchema,
  analiseComparativa: ComparativeAnalysisPortugueseSchema,
  analiseMercado: MarketAnalysisPortugueseSchema,
  analyticsClientes: CustomerAnalyticsPortugueseSchema,
  analyticsProdutos: ProductAnalyticsPortugueseSchema,
});

export type AnalyticsDashboardPortuguese = z.infer<typeof AnalyticsDashboardPortugueseSchema>;
