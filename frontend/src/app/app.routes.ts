import { Routes } from '@angular/router';
import { ViewProductsComponent } from './pages/products/view-products/view-products.component';

export const routes: Routes = [
    {
        path: 'inventory',
        component: ViewProductsComponent,
    },
];
