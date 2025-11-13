import { RouterModule, Routes } from '@angular/router';
import { Phase1 } from './pages/phase-1/phase-1';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', component: Phase1 }, // 👈 ruta inicial
  { path: 'phase-1', component: Phase1 }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}