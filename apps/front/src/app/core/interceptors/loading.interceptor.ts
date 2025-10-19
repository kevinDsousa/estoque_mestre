import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

let activeRequests = 0;

export const LoadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const apiService = inject(ApiService);

  // Skip loading for certain requests
  if (shouldSkipLoading(req)) {
    return next(req);
  }

  activeRequests++;
  if (activeRequests === 1) {
    // Show loading
    (apiService as any).setLoading(true);
  }

  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      if (activeRequests === 0) {
        // Hide loading
        (apiService as any).setLoading(false);
      }
    })
  );
};

function shouldSkipLoading(req: HttpRequest<any>): boolean {
  // Skip loading for certain endpoints
  const skipEndpoints = [
    '/auth/refresh',
    '/health',
    '/ping'
  ];

  return skipEndpoints.some(endpoint => req.url.includes(endpoint));
}