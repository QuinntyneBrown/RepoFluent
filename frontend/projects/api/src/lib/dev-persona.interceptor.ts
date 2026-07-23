import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DevPersonaService } from './dev-persona.service';

export const devPersonaInterceptor: HttpInterceptorFn = (request, next) => {
  const persona = inject(DevPersonaService).current();
  return next(request.clone({ setHeaders: { 'X-RepoFluent-Dev-User': persona } }));
};
