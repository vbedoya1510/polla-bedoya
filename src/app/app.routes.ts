import { RouterModule, Routes } from '@angular/router';
import { Phase1 } from './pages/phase-1/phase-1';
import { NgModule } from '@angular/core';
import { Positions } from './pages/positions/positions';
import { Finals } from './pages/finals/finals';
import { Players } from './pages/players/players';
import { Login } from './pages/login/login';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login }, 
  { path: 'phase-1', component: Phase1, canActivate: [authGuard], data: { phaseNumber: 1 } },
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