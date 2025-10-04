/**
 * Notification View Models
 */

import { z } from 'zod';

// Notification Types
export enum NotificationType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  EXPIRATION_WARNING = 'EXPIRATION_WARNING',
  EXPIRED_PRODUCT = 'EXPIRED_PRODUCT',
  OVERDUE_PAYMENT = 'OVERDUE_PAYMENT',
  NEW_ORDER = 'NEW_ORDER',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  SECURITY_ALERT = 'SECURITY_ALERT',
  USER_ACTIVITY = 'USER_ACTIVITY',
  REPORT_READY = 'REPORT_READY',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

// Base Notification
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(NotificationPriority),
  status: z.nativeEnum(NotificationStatus),
  title: z.string(),
  message: z.string(),
  userId: z.string().uuid(),
  companyId: z.string().uuid(),
  entityId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  readAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Notification Template
export const NotificationTemplateSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(NotificationPriority),
  title: z.string(),
  message: z.string(),
  variables: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;

// Notification Preferences
export const NotificationPreferencesSchema = z.object({
  userId: z.string().uuid(),
  email: z.object({
    enabled: z.boolean(),
    types: z.array(z.nativeEnum(NotificationType)),
    frequency: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER']),
  }),
  push: z.object({
    enabled: z.boolean(),
    types: z.array(z.nativeEnum(NotificationType)),
  }),
  sms: z.object({
    enabled: z.boolean(),
    types: z.array(z.nativeEnum(NotificationType)),
    phone: z.string().optional(),
  }),
  inApp: z.object({
    enabled: z.boolean(),
    types: z.array(z.nativeEnum(NotificationType)),
  }),
  updatedAt: z.date(),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

// Notification Summary
export const NotificationSummarySchema = z.object({
  total: z.number(),
  unread: z.number(),
  byType: z.record(z.number()),
  byPriority: z.record(z.number()),
  recent: z.array(NotificationSchema),
});

export type NotificationSummary = z.infer<typeof NotificationSummarySchema>;

// Bulk Notification
export const BulkNotificationSchema = z.object({
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(NotificationPriority),
  title: z.string(),
  message: z.string(),
  userIds: z.array(z.string().uuid()).optional(),
  companyIds: z.array(z.string().uuid()).optional(),
  roles: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  scheduledFor: z.date().optional(),
});

export type BulkNotification = z.infer<typeof BulkNotificationSchema>;

// Notification History
export const NotificationHistorySchema = z.object({
  id: z.string().uuid(),
  notificationId: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.enum(['SENT', 'DELIVERED', 'READ', 'CLICKED', 'ARCHIVED', 'DELETED']),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
});

export type NotificationHistory = z.infer<typeof NotificationHistorySchema>;

// ==============================================
// VERSÕES EM PORTUGUÊS PARA APRESENTAÇÃO
// ==============================================

// Tipos de Notificação em Português
export enum NotificationTypePortuguese {
  ESTOQUE_BAIXO = 'ESTOQUE_BAIXO',
  SEM_ESTOQUE = 'SEM_ESTOQUE',
  AVISO_VENCIMENTO = 'AVISO_VENCIMENTO',
  PRODUTO_VENCIDO = 'PRODUTO_VENCIDO',
  PAGAMENTO_VENCIDO = 'PAGAMENTO_VENCIDO',
  NOVO_PEDIDO = 'NOVO_PEDIDO',
  PEDIDO_ENVIADO = 'PEDIDO_ENVIADO',
  PEDIDO_ENTREGUE = 'PEDIDO_ENTREGUE',
  MANUTENCAO_SISTEMA = 'MANUTENCAO_SISTEMA',
  ALERTA_SEGURANCA = 'ALERTA_SEGURANCA',
  ATIVIDADE_USUARIO = 'ATIVIDADE_USUARIO',
  RELATORIO_PRONTO = 'RELATORIO_PRONTO',
}

export enum NotificationPriorityPortuguese {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export enum NotificationStatusPortuguese {
  NAO_LIDA = 'NAO_LIDA',
  LIDA = 'LIDA',
  ARQUIVADA = 'ARQUIVADA',
  EXCLUIDA = 'EXCLUIDA',
}

// Notificação Base em Português
export const NotificationPortugueseSchema = z.object({
  id: z.string().uuid(),
  tipo: z.nativeEnum(NotificationTypePortuguese),
  prioridade: z.nativeEnum(NotificationPriorityPortuguese),
  status: z.nativeEnum(NotificationStatusPortuguese),
  titulo: z.string(),
  mensagem: z.string(),
  idUsuario: z.string().uuid(),
  idEmpresa: z.string().uuid(),
  idEntidade: z.string().uuid().optional(),
  tipoEntidade: z.string().optional(),
  metadados: z.record(z.any()).optional(),
  lidaEm: z.date().optional(),
  criadaEm: z.date(),
  atualizadaEm: z.date(),
});

export type NotificationPortuguese = z.infer<typeof NotificationPortugueseSchema>;

// Template de Notificação em Português
export const NotificationTemplatePortugueseSchema = z.object({
  id: z.string().uuid(),
  tipo: z.nativeEnum(NotificationTypePortuguese),
  prioridade: z.nativeEnum(NotificationPriorityPortuguese),
  titulo: z.string(),
  mensagem: z.string(),
  variaveis: z.array(z.string()),
  ativo: z.boolean(),
  criadoEm: z.date(),
  atualizadoEm: z.date(),
});

export type NotificationTemplatePortuguese = z.infer<typeof NotificationTemplatePortugueseSchema>;

// Preferências de Notificação em Português
export const NotificationPreferencesPortugueseSchema = z.object({
  idUsuario: z.string().uuid(),
  email: z.object({
    habilitado: z.boolean(),
    tipos: z.array(z.nativeEnum(NotificationTypePortuguese)),
    frequencia: z.enum(['IMEDIATO', 'DIARIO', 'SEMANAL', 'NUNCA']),
  }),
  push: z.object({
    habilitado: z.boolean(),
    tipos: z.array(z.nativeEnum(NotificationTypePortuguese)),
  }),
  sms: z.object({
    habilitado: z.boolean(),
    tipos: z.array(z.nativeEnum(NotificationTypePortuguese)),
    telefone: z.string().optional(),
  }),
  noApp: z.object({
    habilitado: z.boolean(),
    tipos: z.array(z.nativeEnum(NotificationTypePortuguese)),
  }),
  atualizadoEm: z.date(),
});

export type NotificationPreferencesPortuguese = z.infer<typeof NotificationPreferencesPortugueseSchema>;

// Resumo de Notificações em Português
export const NotificationSummaryPortugueseSchema = z.object({
  total: z.number(),
  naoLidas: z.number(),
  porTipo: z.record(z.number()),
  porPrioridade: z.record(z.number()),
  recentes: z.array(NotificationPortugueseSchema),
});

export type NotificationSummaryPortuguese = z.infer<typeof NotificationSummaryPortugueseSchema>;

// Notificação em Massa em Português
export const BulkNotificationPortugueseSchema = z.object({
  tipo: z.nativeEnum(NotificationTypePortuguese),
  prioridade: z.nativeEnum(NotificationPriorityPortuguese),
  titulo: z.string(),
  mensagem: z.string(),
  idsUsuarios: z.array(z.string().uuid()).optional(),
  idsEmpresas: z.array(z.string().uuid()).optional(),
  roles: z.array(z.string()).optional(),
  metadados: z.record(z.any()).optional(),
  agendadaPara: z.date().optional(),
});

export type BulkNotificationPortuguese = z.infer<typeof BulkNotificationPortugueseSchema>;

// Histórico de Notificações em Português
export const NotificationHistoryPortugueseSchema = z.object({
  id: z.string().uuid(),
  idNotificacao: z.string().uuid(),
  idUsuario: z.string().uuid(),
  acao: z.enum(['ENVIADA', 'ENTREGUE', 'LIDA', 'CLICADA', 'ARQUIVADA', 'EXCLUIDA']),
  dataHora: z.date(),
  metadados: z.record(z.any()).optional(),
});

export type NotificationHistoryPortuguese = z.infer<typeof NotificationHistoryPortugueseSchema>;
