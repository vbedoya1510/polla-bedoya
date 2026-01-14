import { RouterModule, Routes } from '@angular/router';
import { Phase1 } from './pages/phase-1/phase-1';
import { NgModule } from '@angular/core';
import { Positions } from './pages/positions/positions';
import { Finals } from './pages/finals/finals';
import { Phase2 } from './pages/phase-2/phase-2';
import { Phase3 } from './pages/phase-3/phase-3';
import { Phase4 } from './pages/phase-4/phase-4';
import { Players } from './pages/players/players';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login }, 
  { path: 'phase-1', component: Phase1 },
  { path: 'positions', component: Positions },
  { path: 'phase-2', component: Phase2 },
  { path: 'phase-3', component: Phase3 },
  { path: 'phase-4', component: Phase4 },
  { path: 'finals', component: Finals },
  { path: 'players', component: Players },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}