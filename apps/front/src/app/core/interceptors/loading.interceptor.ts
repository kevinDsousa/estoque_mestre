import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private apiService: ApiService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading for certain requests
    if (this.shouldSkipLoading(req)) {
      return next.handle(req);
    }

    this.activeRequests++;
    if (this.activeRequests === 1) {
      // Show loading
      this.apiService['setLoading'](true);
    }

    return next.handle(req).pipe(
      finalize(() => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          // Hide loading
          this.apiService['setLoading'](false);
        }
      })
    );
  }

  private shouldSkipLoading(req: HttpRequest<any>): boolean {
    // Skip loading for certain endpoints
    const skipEndpoints = [
      '/auth/refresh',
      '/health',
      '/ping'
    ];

    return skipEndpoints.some(endpoint => req.url.includes(endpoint));
  }
}
