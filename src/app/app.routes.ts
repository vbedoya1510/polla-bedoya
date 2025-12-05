import { RouterModule, Routes } from '@angular/router';
import { Phase1 } from './pages/phase-1/phase-1';
import { NgModule } from '@angular/core';
import { Positions } from './pages/positions/positions';
import { Finals } from './pages/finals/finals';
import { Phase2 } from './pages/phase-2/phase-2';

export const routes: Routes = [
  { path: '', component: Positions }, // 👈 ruta inicial
  { path: 'phase-1', component: Phase1 },
  { path: 'positions', component: Positions },
  { path: 'finals', component: Finals },
  { path: 'phase-2', component: Phase2 },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}