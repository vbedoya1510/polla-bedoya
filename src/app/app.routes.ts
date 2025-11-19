import { RouterModule, Routes } from '@angular/router';
import { Phase1 } from './pages/phase-1/phase-1';
import { NgModule } from '@angular/core';
import { Positions } from './pages/positions/positions';

export const routes: Routes = [
  { path: '', component: Positions }, // 👈 ruta inicial
  { path: 'phase-1', component: Phase1 },
  { path: 'positions', component: Positions },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}