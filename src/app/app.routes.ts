import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Products } from './pages/products/products';
import productDetail from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { Orders } from './pages/orders/orders';
import { Login} from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { Location } from './pages/location/location';
import { About} from './pages/about/about';
import { Contact} from './pages/contact/contact';
import { CategoriaPage} from './components/categories_by_id/categories_by_id';
import {ProductDetailComponent} from './pages/ProductDatail/ProductDetail';

//rutas de busqueda
export const routes: Routes = [
  { path: '', component: Home },                     // Página principal
  { path: 'products', component: Products },         // Lista de productos
  { path: 'product/:id', component: productDetail}, // Detalle de producto
  { path: 'cart', component: Cart },                 // Carrito
  { path: 'checkout', component: Checkout},         // Checkout
  { path: 'orders', component: Orders },             // Historial de pedidos
  { path: 'login', component: Login },               // Login
  { path: 'register', component: RegisterComponent },// Registro
  { path: 'location', component: Location},          // Ubicación
  { path: 'about', component: About},                //Acerca de
  { path: 'contact', component: Contact},            // Contacto
  {path: 'categoria/:id',component:CategoriaPage }, // Categorías por ID
  { path: 'productos/:id', component: ProductDetailComponent }, // Detalle de producto por ID
  { path: '**', redirectTo: '' }                     // Redirección por defecto
];
