import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Serviço de toast para o frontend
 * 
 * Wrapper do EstoqueToastService com métodos específicos do frontend
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private messageService: MessageService) {}

  /**
   * Mostra um toast de sucesso
   */
  success(title: string, message: string, duration?: number): void {
    this.messageService.add({ severity: 'success', summary: title, detail: message, life: duration ?? 5000 });
  }

  /**
   * Mostra um toast de erro
   */
  error(title: string, message: string, duration?: number): void {
    this.messageService.add({ severity: 'error', summary: title, detail: message, life: duration ?? 7000 });
  }

  /**
   * Mostra um toast de aviso
   */
  warning(title: string, message: string, duration?: number): void {
    this.messageService.add({ severity: 'warn', summary: title, detail: message, life: duration ?? 6000 });
  }

  /**
   * Mostra um toast de informação
   */
  info(title: string, message: string, duration?: number): void {
    this.messageService.add({ severity: 'info', summary: title, detail: message, life: duration ?? 5000 });
  }

  /**
   * Limpa todos os toasts
   */
  clear(): void {
    this.messageService.clear();
  }

  /**
   * Métodos específicos do frontend
   */

  /**
   * Toast para operações de autenticação
   */
  loginSuccess(userName: string): void {
    this.info('Login Realizado', `Bem-vindo, ${userName}!`);
  }

  loginError(message: string): void {
    this.error('Erro no Login', message);
  }

  logoutSuccess(): void {
    this.info('Logout Realizado', 'Você foi desconectado com sucesso');
  }

  /**
   * Toast para operações de formulário
   */
  formSaved(formName: string): void {
    this.success('Formulário Salvo', `${formName} foi salvo com sucesso`);
  }

  formError(formName: string, error: string): void {
    this.error('Erro no Formulário', `Erro ao salvar ${formName}: ${error}`);
  }

  validationError(field: string, message: string): void {
    this.error('Erro de Validação', `${field}: ${message}`);
  }

  /**
   * Toast para operações de API
   */
  apiSuccess(operation: string): void {
    this.success('Operação Concluída', `${operation} realizada com sucesso`);
  }

  apiError(operation: string, error: string): void {
    this.error('Erro na Operação', `Falha ao ${operation}: ${error}`);
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
}