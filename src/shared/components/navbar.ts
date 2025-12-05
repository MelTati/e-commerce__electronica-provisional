import { Component, signal, OnInit, HostListener, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CategoriesService } from '../../app/services/categories.service';
import { CategoriesListInterface } from '../../app/interfaces/categories.list.interface';
import { AuthService } from '../../app/services/auth.service';
import { CartService } from '../../app/services/cart.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit, OnDestroy {
  categories = signal<CategoriesListInterface[]>([]);
  menuOpen = signal(false);
  isClientLogged = signal(false);
  isAdminLogged = signal(false);
  cartTotal = signal('$0.00');

  private cartUpdateSubscription: Subscription | undefined;

  constructor(
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data) => this.categories.set(data)
    });

    this.authService.isClientLoggedIn$.subscribe(v => this.isClientLogged.set(v));
    this.authService.isAdminLoggedIn$.subscribe(v => this.isAdminLogged.set(v));

    // Ejecutar lógica del navegador solo si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.updateCartTotal();

      // Usar un observable de Angular para el intervalo y limpiar en OnDestroy
      this.cartUpdateSubscription = interval(1000).subscribe(() => this.updateCartTotal());
    }
  }

  ngOnDestroy(): void {
    // Limpiar la suscripción al destruir el componente
    if (this.cartUpdateSubscription) {
      this.cartUpdateSubscription.unsubscribe();
    }
  }

  // --- MÉTODOS DE COMPONENTE ---

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout() {
    // Toda la lógica de logout que usa localStorage debe estar protegida
    if (isPlatformBrowser(this.platformId)) {
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
    } else {
        // Si no es el navegador, simplemente hacemos el logout sin tocar localStorage
        this.finalizarLogout();
    }
  }

  private finalizarLogout() {
    // Estas líneas son seguras ya que el servicio CartService (idealmente) maneja el SSR
    this.cartService.currentCartId.set(null);

    // Proteger las interacciones con localStorage
    if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('venta_id');
    }

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
    // Si no estamos en el navegador, no hacemos nada que dependa de localStorage
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

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
      // Acceso a localStorage protegido
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
    // 🔑 CORRECCIÓN: Proteger el acceso al objeto 'document' con isPlatformBrowser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

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