import { Routes } from '@angular/router';
import { LendingAddComponent } from './pages/lending/lending-add/lending-add.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'lendings/active',
    pathMatch: 'full',
  },
  {
    path: 'add-lending',
    component: LendingAddComponent,
    patchMatch: 'full'},

  { path: '**', redirectTo: 'lendings/active' },
];
