import { Injectable, inject } from '@angular/core';
import { EstoqueToastService } from '@estoque-mestre/primeng-ui';

/**
 * Serviço de toast para o frontend
 * 
 * Wrapper do EstoqueToastService com métodos específicos do frontend
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private estoqueToastService = inject(EstoqueToastService);

  /**
   * Mostra um toast de sucesso
   */
  success(title: string, message: string, duration?: number): void {
    this.estoqueToastService.success(title, message, duration);
  }

  /**
   * Mostra um toast de erro
   */
  error(title: string, message: string, duration?: number): void {
    this.estoqueToastService.error(title, message, duration);
  }

  /**
   * Mostra um toast de aviso
   */
  warning(title: string, message: string, duration?: number): void {
    this.estoqueToastService.warning(title, message, duration);
  }

  /**
   * Mostra um toast de informação
   */
  info(title: string, message: string, duration?: number): void {
    this.estoqueToastService.info(title, message, duration);
  }

  /**
   * Limpa todos os toasts
   */
  clear(): void {
    this.estoqueToastService.clear();
  }

  /**
   * Métodos específicos do frontend
   */

  /**
   * Toast para operações de autenticação
   */
  loginSuccess(userName: string): void {
    this.estoqueToastService.userLoggedIn(userName);
  }

  loginError(message: string): void {
    this.error('Erro no Login', message);
  }

  logoutSuccess(): void {
    this.estoqueToastService.userLoggedOut();
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
    this.estoqueToastService.validationError(field, message);
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
    this.estoqueToastService.fileUploaded(fileName);
  }

  fileUploadFailed(fileName: string, error: string): void {
    this.estoqueToastService.fileUploadFailed(fileName, error);
  }

  fileDeleted(fileName: string): void {
    this.estoqueToastService.fileDeleted(fileName);
  }

  /**
   * Toast para operações de produto
   */
  productCreated(productName: string): void {
    this.estoqueToastService.productCreated(productName);
  }

  productUpdated(productName: string): void {
    this.estoqueToastService.productUpdated(productName);
  }

  productDeleted(productName: string): void {
    this.estoqueToastService.productDeleted(productName);
  }

  /**
   * Toast para operações de estoque
   */
  stockUpdated(productName: string, quantity: number): void {
    this.estoqueToastService.stockUpdated(productName, quantity);
  }

  lowStockWarning(productName: string, quantity: number): void {
    this.estoqueToastService.lowStockWarning(productName, quantity);
  }

  outOfStock(productName: string): void {
    this.estoqueToastService.outOfStock(productName);
  }
}