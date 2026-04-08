import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NDataService } from '../services/ndata.service';

export function phaseGuard(phase: number): CanActivateFn {
  return () => {
    const dataService = inject(NDataService);
    const router = inject(Router);
    if (dataService.phaseUnlocked()[phase]) return true;
    return router.createUrlTree(['/']);
  };
}
