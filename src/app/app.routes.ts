import { RouterModule, Routes } from '@angular/router';
import { Phase1 } from './pages/phase-1/phase-1';
import { NgModule } from '@angular/core';
import { Positions } from './pages/positions/positions';
import { Finals } from './pages/finals/finals';
import { Players } from './pages/players/players';
import { Login } from './pages/login/login';
import { authGuard } from './services/auth.guard';
import { NPhase1 } from './pages/nphase-1/nphase-1';
import { NPhase2 } from './pages/nphase-2/nphase-2';
import { Nphase3 } from './pages/nphase-3/nphase-3';
import { NphaseFinals } from './pages/nphase-finals/nphase-finals';
import { NFinals } from './pages/nfinals/nfinals';

export const routes: Routes = [
  { path: '', component: NPhase1 },
  { path: 'login', component: Login }, 
  { path: 'phase-1', component: Phase1, canActivate: [authGuard], data: { phaseNumber: 1 } },
  { path: 'fase1', component: NPhase1, data: { phaseNumber: 1 } },
  { path: 'fase2', component: NPhase2, data: { phaseNumber: 2 } },
  { path: 'fase3', component: Nphase3, data: { phaseNumber: 3 } },
  { path: 'finales', component: NphaseFinals, data: { phaseNumber: 3 } },
  { path: 'posiciones', component: NFinals },
  { path: 'positions', component: Positions },
  { path: 'phase-2', component: Phase1, canActivate: [authGuard], data: { phaseNumber: 2 } },
  { path: 'phase-3', component: Phase1, canActivate: [authGuard], data: { phaseNumber: 3 } },
  { path: 'phase-4', component: Phase1, canActivate: [authGuard], data: { phaseNumber: 4 } },
  { path: 'finals', component: Finals },
  { path: 'players', component: Players },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}