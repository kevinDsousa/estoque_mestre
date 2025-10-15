/**
 * Error Log interfaces
 */

export enum ErrorSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum ErrorSource {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  API = 'API',
  DATABASE = 'DATABASE'
}

export enum ErrorStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  IGNORED = 'IGNORED'
}

export interface IErrorContext {
  id: string;
  errorLogId: string;
  
  // Contexto da aplicação
  route?: string;
  componentName?: string;
  action?: string;
  
  // Estado da aplicação
  appState?: Record<string, any>;
  userState?: Record<string, any>;
  formData?: Record<string, any>;
  
  // Performance
  loadTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IErrorStack {
  id: string;
  errorLogId: string;
  
  // Stack trace
  stackTrace: string;
  stackFrames?: Record<string, any>[];
  
  // Arquivo e linha
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  functionName?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IErrorMetadata {
  // Informações da requisição
  requestBody?: any;
  responseBody?: any;
  headers?: Record<string, any>;
  query?: Record<string, any>;
  params?: Record<string, any>;
  
  // Informações do erro
  error?: any;
  stack?: string;
  
  // Informações adicionais
  additionalInfo?: Record<string, any>;
}
