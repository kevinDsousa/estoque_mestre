import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error, req);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse, request: HttpRequest<any>): void {
    // Skip error handling for certain requests
    if (this.shouldSkipErrorHandling(request)) {
      return;
    }

    let errorMessage = 'Ocorreu um erro inesperado';
    let errorTitle = 'Erro';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 400:
          errorTitle = 'Dados inválidos';
          errorMessage = 'Verifique os dados informados e tente novamente.';
          break;
        case 401:
          errorTitle = 'Não autorizado';
          errorMessage = 'Sua sessão expirou. Faça login novamente.';
          // Don't show notification for 401, let auth interceptor handle it
          return;
        case 403:
          errorTitle = 'Acesso negado';
          errorMessage = 'Você não tem permissão para realizar esta ação.';
          break;
        case 404:
          errorTitle = 'Não encontrado';
          errorMessage = 'O recurso solicitado não foi encontrado.';
          break;
        case 409:
          errorTitle = 'Conflito';
          errorMessage = 'Já existe um registro com estes dados.';
          break;
        case 422:
          errorTitle = 'Dados inválidos';
          errorMessage = 'Verifique os dados informados e tente novamente.';
          break;
        case 429:
          errorTitle = 'Muitas tentativas';
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
        case 500:
          errorTitle = 'Erro do servidor';
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
        case 503:
          errorTitle = 'Serviço indisponível';
          errorMessage = 'Serviço temporariamente indisponível. Tente novamente mais tarde.';
          break;
        default:
          errorTitle = `Erro ${error.status}`;
          errorMessage = error.message || 'Ocorreu um erro inesperado.';
      }
    }

    // Show error notification
    this.notificationService.error(errorTitle, errorMessage);

    // Handle specific error cases
    if (error.status === 403) {
      this.router.navigate(['/unauthorized']);
    } else if (error.status >= 500) {
      // Log server errors for debugging
      console.error('Server Error:', error);
    }
  }

  private shouldSkipErrorHandling(request: HttpRequest<any>): boolean {
    // Skip error handling for certain endpoints
    const skipEndpoints = [
      '/auth/refresh',
      '/health',
      '/ping'
    ];

    return skipEndpoints.some(endpoint => request.url.includes(endpoint));
  }
}
