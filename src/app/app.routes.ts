import { Routes } from '@angular/router';
import { Home } from './client/pages/home/home';
import { Products } from './client/pages/products/products';
import productDetail from './client/pages/product-detail/product-detail';
import { Cart } from './client/pages/cart/cart';
import { LoginCliente } from './client/pages/login/login';
import { RegisterComponent } from './client/pages/register/register';
import { Location } from './client/pages/location/location';
import { About } from './client/pages/about/about';
import { Contact } from './client/pages/contact/contact';
import { AdminLayout } from './admin/shared/dashboard';
import { CategoriaPage } from './client/components/categories_by_id/categories_by_id';
import { ProductDetailComponent } from './client/pages/ProductDatail/ProductDetail';
import { AdminUsuarios } from './admin/pages/register-admin/admin-usuarios';
import { AdminClientes } from './admin/pages/register-cliente/admin-cliente';
import { AdminProductos } from './admin/pages/register-products/admin-product';
import { AdminVentas } from './admin/pages/register-ventas/admin-ventas';
import { LoginAdmin } from './admin/pages/login-admin/login-admin';
import { AdminGuard } from './services/admin.guard';
import { PerfilCliente } from './client/perfil-cliente/perfil-cliente';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: LoginCliente },
  { path: 'register', component: RegisterComponent },
  { path: 'location', component: Location },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },  
  { path: 'login-admin', component: LoginAdmin },
  { path: 'categoria/:id', component: CategoriaPage },
  { path: 'productos/:id', component: ProductDetailComponent },
  { path: 'carrito', component: Cart },
  { path: 'products', component: Products },
  { path: 'product/:id', component: productDetail },
  { path: 'perfil', component: PerfilCliente },
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
