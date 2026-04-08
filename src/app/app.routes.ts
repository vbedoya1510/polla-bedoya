import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { NPhase1 } from './pages/nphase-1/nphase-1';
import { NPhase2 } from './pages/nphase-2/nphase-2';
import { Nphase3 } from './pages/nphase-3/nphase-3';
import { NphaseFinals } from './pages/nphase-finals/nphase-finals';
import { NFinals } from './pages/nfinals/nfinals';
import { Npositions } from './pages/npositions/npositions';
import { phaseGuard } from './guards/phase.guard';

export const routes: Routes = [
  { path: '', component: NPhase1 },
  { path: 'fase1', component: NPhase1 },
  { path: 'fase2', component: NPhase2, canActivate: [phaseGuard(2)] },
  { path: 'fase3', component: Nphase3, canActivate: [phaseGuard(3)] },
  { path: 'finales', component: NphaseFinals, canActivate: [phaseGuard(4)] },
  { path: 'posiciones', component: NFinals },
  { path: 'participantes', component: Npositions },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}