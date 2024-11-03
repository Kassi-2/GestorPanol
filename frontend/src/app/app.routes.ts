import { Routes } from '@angular/router';
import { LendingActiveComponent } from './pages/lending/lending-active/lending-active.component';
import { LendingFinishComponent } from './pages/lending/lending-finish/lending-finish.component';
import { LendingOptionsComponent } from './pages/lending/lending-options/lending-options.component';

export const routes: Routes = [
  {  path: 'lendings/active', component: LendingActiveComponent },
  { path: 'lendings/finish', component: LendingFinishComponent },
  { path: 'lendings/options', component: LendingOptionsComponent },

];
