/**
 * Payment interfaces
 */

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PIX = 'PIX',
  BOLETO = 'BOLETO'
}

export enum PaymentType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  ONE_TIME = 'ONE_TIME',
  REFUND = 'REFUND'
}

export interface IPaymentDetails {
  // Card information (if applicable)
  cardLast4?: string;
  cardBrand?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  
  // Bank transfer information
  bankName?: string;
  bankAccount?: string;
  
  // PIX information
  pixKey?: string;
  pixQrCode?: string;
  
  // Boleto information
  boletoUrl?: string;
  boletoBarcode?: string;
  boletoDueDate?: Date;
  
  // Additional information
  refundOf?: string; // Original payment ID for refunds
  description?: string;
  statementDescriptor?: string;
}

export interface IPaymentFailure {
  code: string;
  reason: string;
  message?: string;
  declineCode?: string;
  failureType?: string;
  failureSource?: string;
  failureCode?: string;
  failureMessage?: string;
  failureReason?: string;
  failureTypeCode?: string;
  failureTypeMessage?: string;
  failureTypeReason?: string;
}
