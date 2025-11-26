import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import productDetail from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { Orders } from './pages/orders/orders';
import { Login } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { Location } from './pages/location/location';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { CategoriesDashboardComponent } from './admin/pages/categories-dashboard/categories-dashboard';
import { AdminLayout } from './admin/shared/dashboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: Products },
  { path: 'product/:id', component: productDetail },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout },
  { path: 'orders', component: Orders },
  { path: 'login', component: Login },
  { path: 'register', component: RegisterComponent },
  { path: 'location', component: Location },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },

  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: 'categories', component: CategoriesDashboardComponent },
      { path: '', redirectTo: 'categories', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
