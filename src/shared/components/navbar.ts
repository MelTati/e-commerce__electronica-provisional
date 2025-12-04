import { Component, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CategoriesService } from '../../app/services/categories.service';
import { CategoriesListInterface } from '../../app/interfaces/categories.list.interface';
import { AuthService } from '../../app/services/auth.service';
import { CartService } from '../../app/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {

  categories = signal<CategoriesListInterface[]>([]);
  menuOpen = signal(false);
  isClientLogged = signal(false);
  isAdminLogged = signal(false);
  cartTotal = signal('$0.00');

  constructor(
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data) => this.categories.set(data)
    });

    this.authService.isClientLoggedIn$.subscribe(v => this.isClientLogged.set(v));
    this.authService.isAdminLoggedIn$.subscribe(v => this.isAdminLogged.set(v));

    this.updateCartTotal();
    setInterval(() => this.updateCartTotal(), 1000);
  }

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout() {
    const idventas = this.cartService.currentCartId();
    const emailVerified = localStorage.getItem('email_verified') === 'true' ||
                          localStorage.getItem('email_verified_at') !== null;

    if (idventas && emailVerified) {
      this.cartService.obtenerCarrito(idventas).subscribe({
        next: (items) => {
          const localCart = items.map(item => ({
            codigo_producto: item.codigo_producto,
            nombre: item.Producto,
            precio: item.PrecioUnitario,
            cantidad: item.cantidad
          }));
          localStorage.setItem('localCart', JSON.stringify(localCart));
          this.finalizarLogout();
        },
        error: () => this.finalizarLogout()
      });
    } else {
      localStorage.removeItem('localCart');
      this.cartTotal.set('$0.00');
      this.finalizarLogout();
    }
  }

  private finalizarLogout() {
    this.cartService.currentCartId.set(null);
    localStorage.removeItem('venta_id');
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToAdminProfile() {
    this.router.navigate(['/admin/perfil-admin']);
  }

  trackById(index: number, item: CategoriesListInterface) {
    return item.id_categorias;
  }

  updateCartTotal(): void {
    if (this.isClientLogged()) {
      const idventas = this.cartService.currentCartId();
      if (idventas) {
        this.cartService.obtenerCarrito(idventas).subscribe({
          next: (items) => {
            const total = items.reduce((sum, item) => sum + item.PrecioUnitario * item.cantidad, 0);
            this.cartTotal.set(`$${total.toFixed(2)}`);
          },
          error: () => this.cartTotal.set('$0.00')
        });
      } else {
        this.cartTotal.set('$0.00');
      }
    } else {
      const emailWasVerified = localStorage.getItem('email_verified') === 'true' ||
                               localStorage.getItem('email_verified_at') !== null;

      if (!emailWasVerified) {
        localStorage.removeItem('localCart');
        this.cartTotal.set('$0.00');
        return;
      }

      const cart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const total = cart.reduce((sum: number, item: any) => sum + item.precio * item.cantidad, 0);
      this.cartTotal.set(`$${total.toFixed(2)}`);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const menu = document.querySelector('.header__categories');
    const hamburger = document.querySelector('.header__hamburger');

    if (
      menu && hamburger &&
      !menu.contains(event.target as Node) &&
      !hamburger.contains(event.target as Node)
    ) {
      this.closeMenu();
    }
  }
}