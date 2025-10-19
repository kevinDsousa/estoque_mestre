import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { EstoqueToastMessage, EstoqueToastSeverity } from '../components/estoque-toast/estoque-toast.component';

/**
 * Serviço de toast para Estoque Mestre
 * 
 * Wrapper do PrimeNG MessageService com métodos específicos do sistema
 * 
 * @example
 * ```typescript
 * constructor(private toastService: EstoqueToastService) {}
 * 
 * showSuccess() {
 *   this.toastService.success('Sucesso!', 'Operação realizada com sucesso');
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class EstoqueToastService {
  constructor(private messageService: MessageService) {}

  /**
   * Mostra um toast de sucesso
   */
  success(summary: string, detail: string, life?: number, sticky?: boolean): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: life || 5000,
      sticky: sticky || false
    });
  }

  /**
   * Mostra um toast de erro
   */
  error(summary: string, detail: string, life?: number, sticky?: boolean): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: life || 7000, // Erros ficam mais tempo
      sticky: sticky || false
    });
  }

  /**
   * Mostra um toast de aviso
   */
  warning(summary: string, detail: string, life?: number, sticky?: boolean): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: life || 6000,
      sticky: sticky || false
    });
  }

  /**
   * Mostra um toast de informação
   */
  info(summary: string, detail: string, life?: number, sticky?: boolean): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: life || 5000,
      sticky: sticky || false
    });
  }

  /**
   * Mostra um toast customizado
   */
  show(message: EstoqueToastMessage): void {
    this.messageService.add({
      severity: message.severity,
      summary: message.summary,
      detail: message.detail,
      life: message.life || 5000,
      sticky: message.sticky || false,
      closable: message.closable !== false,
      data: message.data
    });
  }

  /**
   * Limpa todos os toasts
   */
  clear(): void {
    this.messageService.clear();
  }

  /**
   * Métodos específicos do sistema Estoque Mestre
   */

  /**
   * Toast para operações de produto
   */
  productCreated(productName: string): void {
    this.success('Produto Criado', `${productName} foi criado com sucesso`);
  }

  productUpdated(productName: string): void {
    this.success('Produto Atualizado', `${productName} foi atualizado com sucesso`);
  }

  productDeleted(productName: string): void {
    this.info('Produto Removido', `${productName} foi removido com sucesso`);
  }

  /**
   * Toast para operações de estoque
   */
  stockUpdated(productName: string, quantity: number): void {
    this.success('Estoque Atualizado', `Estoque de ${productName} atualizado para ${quantity} unidades`);
  }

  lowStockWarning(productName: string, quantity: number): void {
    this.warning('Estoque Baixo', `${productName} está com estoque baixo (${quantity} unidades)`);
  }

  outOfStock(productName: string): void {
    this.error('Estoque Esgotado', `${productName} está sem estoque`);
  }

  /**
   * Toast para operações de transação
   */
  transactionCompleted(amount: number): void {
    this.success('Transação Concluída', `Transação de R$ ${amount.toFixed(2)} realizada com sucesso`);
  }

  transactionFailed(reason: string): void {
    this.error('Transação Falhou', `Falha na transação: ${reason}`);
  }

  /**
   * Toast para operações de usuário
   */
  userLoggedIn(userName: string): void {
    this.info('Login Realizado', `Bem-vindo, ${userName}!`);
  }

  userLoggedOut(): void {
    this.info('Logout Realizado', 'Você foi desconectado com sucesso');
  }

  /**
   * Toast para operações de integração
   */
  integrationSuccess(integrationName: string): void {
    this.success('Integração Conectada', `${integrationName} conectada com sucesso`);
  }

  integrationError(integrationName: string, error: string): void {
    this.error('Erro de Integração', `Falha na integração ${integrationName}: ${error}`);
  }

  /**
   * Toast para operações de backup
   */
  backupStarted(): void {
    this.info('Backup Iniciado', 'O backup dos dados foi iniciado');
  }

  backupCompleted(): void {
    this.success('Backup Concluído', 'Backup dos dados realizado com sucesso');
  }

  backupFailed(error: string): void {
    this.error('Backup Falhou', `Falha no backup: ${error}`);
  }

  /**
   * Toast para validações
   */
  validationError(field: string, message: string): void {
    this.error('Erro de Validação', `${field}: ${message}`);
  }

  requiredField(field: string): void {
    this.warning('Campo Obrigatório', `${field} é obrigatório`);
  }

  /**
   * Toast para operações de arquivo
   */
  fileUploaded(fileName: string): void {
    this.success('Arquivo Enviado', `${fileName} foi enviado com sucesso`);
  }

  fileUploadFailed(fileName: string, error: string): void {
    this.error('Falha no Upload', `Erro ao enviar ${fileName}: ${error}`);
  }

  fileDeleted(fileName: string): void {
    this.info('Arquivo Removido', `${fileName} foi removido com sucesso`);
  }
}
