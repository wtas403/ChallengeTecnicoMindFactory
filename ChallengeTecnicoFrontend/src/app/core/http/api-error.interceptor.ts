import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { mapHttpErrorToApiError } from './api-error.mapper';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      const mappedError = mapHttpErrorToApiError(error);
      return throwError(() => mappedError);
    }),
  );
