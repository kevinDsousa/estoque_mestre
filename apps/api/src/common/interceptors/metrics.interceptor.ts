import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const startTime = Date.now();
    const method = request.method;
    const route = this.getRoutePath(request);
    const companyId = request.user?.companyId || 'anonymous';

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000;
        const statusCode = response.statusCode;
        
        this.metricsService.recordHttpRequest(
          method,
          route,
          statusCode,
          duration,
          companyId
        );
      }),
      catchError((error) => {
        const duration = (Date.now() - startTime) / 1000;
        const statusCode = error.status || 500;
        
        this.metricsService.recordHttpRequest(
          method,
          route,
          statusCode,
          duration,
          companyId
        );

        // Record error metrics
        this.metricsService.recordError(
          error.constructor.name,
          this.getModuleName(context),
          companyId,
          this.getErrorSeverity(statusCode)
        );

        return throwError(() => error);
      })
    );
  }

  private getRoutePath(request: any): string {
    const baseUrl = request.baseUrl || '';
    const path = request.route?.path || request.url;
    return `${baseUrl}${path}`.replace(/\/\d+/g, '/:id'); // Replace IDs with :id
  }

  private getModuleName(context: ExecutionContext): string {
    const controller = context.getClass();
    return controller.name.replace('Controller', '');
  }

  private getErrorSeverity(statusCode: number): 'low' | 'medium' | 'high' | 'critical' {
    if (statusCode >= 500) return 'critical';
    if (statusCode >= 400) return 'high';
    if (statusCode >= 300) return 'medium';
    return 'low';
  }
}
