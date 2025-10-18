import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Add user context to the request for easy access in services
    if (user) {
      request.authContext = {
        userId: user.userId || user.id,
        companyId: user.companyId,
        role: user.role,
        email: user.email,
      };
    }

    return next.handle().pipe(
      tap(() => {
        // Clean up after request
        delete request.authContext;
      })
    );
  }
}

