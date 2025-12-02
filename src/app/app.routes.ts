import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import productDetail from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { LoginCliente } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { Location } from './pages/location/location';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { AdminLayout } from './admin/shared/dashboard';
import { CategoriaPage } from './components/categories_by_id/categories_by_id';
import { ProductDetailComponent } from './pages/ProductDatail/ProductDetail';
import { AdminUsuarios } from './admin/pages/register-admin/admin-usuarios';
import { AdminClientes } from './admin/pages/register-cliente/admin-cliente';
import { AdminProductos } from './admin/pages/register-products/admin-product';
import { AdminVentas } from './admin/pages/register-ventas/admin-ventas';
import { LoginAdmin } from './admin/pages/login-admin/login-admin';
import { AdminGuard } from './services/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', component: Products },
  { path: 'product/:id', component: productDetail },
  { path: 'login', component: LoginCliente },
  { path: 'register', component: RegisterComponent },
  { path: 'location', component: Location },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'categoria/:id', component: CategoriaPage },
  { path: 'productos/:id', component: ProductDetailComponent },
  { path: 'carrito', component: Cart },
  { path: 'login-admin', component: LoginAdmin },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [AdminGuard],
    children: [
      { path: 'admin-usuario', component: AdminUsuarios },
      { path: 'admin-cliente', component: AdminClientes },
      { path: 'admin-product', component: AdminProductos },
      { path: 'admin-ventas', component: AdminVentas },
      { path: '', redirectTo: 'admin-usuario', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
