import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse, ApiError } from '../interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    this.setLoading(true);
    
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * GET request for paginated data
   */
  getPaginated<T>(endpoint: string, params?: any): Observable<PaginatedResponse<T>> {
    this.setLoading(true);
    
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<T>>>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, data)
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    this.setLoading(true);
    
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Upload file
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    this.setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, formData)
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Download file
   */
  downloadFile(endpoint: string, filename?: string): Observable<Blob> {
    this.setLoading(true);
    
    return this.http.get(`${this.baseUrl}/${endpoint}`, { responseType: 'blob' })
      .pipe(
        catchError(this.handleError),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    this.setLoading(false);
    
    let errorMessage = 'Ocorreu um erro inesperado';
    let errorDetails: any = null;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
        errorDetails = error.error.details;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Dados inválidos';
            break;
          case 401:
            errorMessage = 'Não autorizado';
            break;
          case 403:
            errorMessage = 'Acesso negado';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado';
            break;
          case 409:
            errorMessage = 'Conflito de dados';
            break;
          case 422:
            errorMessage = 'Dados de entrada inválidos';
            break;
          case 429:
            errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor';
            break;
          default:
            errorMessage = `Erro ${error.status}: ${error.statusText}`;
        }
      }
    }

    const apiError: ApiError = {
      message: errorMessage,
      status: error.status,
      timestamp: new Date().toISOString(),
      path: error.url || undefined,
      details: errorDetails
    };

    return throwError(() => apiError);
  };

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
