import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Leemos el valor del Signal simplemente llamándolo ()
  if (authService.isLoggedIn()) {
    return true; // Acceso permitido
  } else {
    // Si no está logueado, redirigimos al login
    return router.parseUrl('/login');
  }
};