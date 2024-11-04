import { Routes } from '@angular/router';
import { LendingAddComponent } from './pages/lending/lending-add/lending-add.component';
import { LendingActiveComponent } from './pages/lending/lending-active/lending-active.component';
import { LendingFinishComponent } from './pages/lending/lending-finish/lending-finish.component';
import { LendingOptionsComponent } from './pages/lending/lending-options/lending-options.component';
import { ViewProductsComponent } from './pages/products/view-products/view-products.component';


export const routes: Routes = [
  {
    path: 'add-lending',
    component: LendingAddComponent},
    {  path: 'lendings/active', component: LendingActiveComponent },
    { path: 'lendings/finish', component: LendingFinishComponent },
    { path: 'lendings/options', component: LendingOptionsComponent },
    {
      path: 'inventory',
      component: ViewProductsComponent,
  },

  { path: '**', redirectTo: 'lendings/active' },
];
