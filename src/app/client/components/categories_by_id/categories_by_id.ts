import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Inject } from '@angular/core';

import { CategoriesXProductService } from '../../../services/categories_x_product.service';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { CategoriesXProductDTO } from '../../../interfaces/categories_x_product.interface';

@Component({
  selector: 'app-products-by-category',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './categories_by_id.html',
  styleUrls: ['./categories_by_id.css'],
})
export class CategoriaPage implements OnInit {

  productos = signal<CategoriesXProductDTO[]>([]);
  loading = signal<boolean>(true);

  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private service: CategoriesXProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private snack: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser && !this.cartService.currentCartId()) {
      const storedId = localStorage.getItem('venta_id');
      if (storedId) {
        this.cartService.currentCartId.set(Number(storedId));
      }
    }

    this.route.paramMap.subscribe(params => {
      const categoriaId = Number(params.get('id'));
      if (!isNaN(categoriaId)) {
        this.cargarProductos(categoriaId);
      } else {
        console.error('ID de categoría no válido');
        this.productos.set([]);
        this.loading.set(false);
      }
    });
  }

  cargarProductos(id: number): void {
    this.loading.set(true);

    this.service.getCategoriesXProduct(id).subscribe({
      next: (data: CategoriesXProductDTO[]) => {
        this.productos.set(data);
        this.loading.set(false); 
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.productos.set([]);
        this.loading.set(false);
      }
    });
  }

  addToCart(product: CategoriesXProductDTO): void {
    // Verificar si el cliente ha iniciado sesión
    const clientData = this.authService.getClientData();
    if (clientData) {
      // Lógica de backend existente
      const telefonoCliente = clientData.id;
      const idventas = this.cartService.currentCartId();

      if (!idventas) {
        this.cartService.crearCarrito(telefonoCliente, 1).subscribe({
          next: (res) => {
            this.cartService.currentCartId.set(res.idventas);
            if (this.isBrowser) {
              localStorage.setItem("venta_id", String(res.idventas));
            }
            this.addOrUpdateProduct(res.idventas, product.codigo_producto);
          },
          error: (error) => {
            console.error('Error al crear carrito:', error);
            this.snack.open('No se pudo crear el carrito', 'Cerrar', { duration: 2500 });
          }
        });
      } else {
        this.addOrUpdateProduct(idventas, product.codigo_producto);
      }
    } else {
      // Lógica de localStorage para usuarios no logueados
      let cart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const existing = cart.find((item: any) => item.codigo_producto === product.codigo_producto);
      if (existing) {
        existing.cantidad += 1;
      } else {
        cart.push({
          codigo_producto: product.codigo_producto,
          nombre: product.Producto, // Ajusta si el campo es diferente
          precio: product.fldPrecio, // Ajusta al campo real de precio (e.g., fldPrecio si existe)
          cantidad: 1
        });
      }
      localStorage.setItem('localCart', JSON.stringify(cart));
      this.snack.open('Producto agregado al carrito', 'Cerrar', { duration: 2000 });
      setTimeout(() => {
        this.router.navigate(['/carrito']);
      }, 300);
    }
  }

  private addOrUpdateProduct(idventas: number, codigo_producto: number) {
    this.cartService.addOrUpdateProduct(idventas, codigo_producto, 1).subscribe({
      next: () => {
        this.snack.open('Producto agregado al carrito', 'Cerrar', { duration: 2000 });
        setTimeout(() => {
          this.router.navigate(['/carrito']);
        }, 300);
      },
      error: (error) => {
        console.error('Error al agregar producto:', error);
        this.snack.open('Error al agregar el producto', 'Cerrar', { duration: 2500 });
      }
    });
  }

  openQuickView(id: number): void {
    this.goToProductDetail(id);
  }

  goToProductDetail(id: number): void {
    this.router.navigate(['/productos', id]);
  }

  trackByCodigoProducto(index: number, product: CategoriesXProductDTO): number {
    return product.codigo_producto;
  }

  getProductImage(product: CategoriesXProductDTO): string {
    const imagesMap: Record<string, string> = {
      '555': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBKyeQ56LvXTJVPHr1BTWNYAS6swzezmNk4DkMeX5c2dYw?download=1',
      '10uF': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD1nSU8zRXZRZM0RsYyVk40AYCgxajeJlWSrNZ0EyVH3rA?download=1',
      '100uF': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBxX8M40m94QJfmYzLu7_nUARWbbHrU2ZLMo5D1Q-fB9Kw?download=1',
      '1N4007': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDYrodsIvyZRKkvQVvQ7ILaAUqHhSTg7NTxJEp2wDNDkO8?download=1',
      'LED rojo': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCAmk2l6wRMTZMoDIh1zg4lAbCEMtR2w5m_iI6MahQiDhM?download=1',
      'LED verde': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBpWyJIy869RoZI6T3RPInUAc1oyOsyrulqytkdAxXTlvU?download=1',
      '10kΩ': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQA67S2QOfjiSJrnzfqeGbPzAS1JDEK4yDgYEPvGzzFlBgw?download=1',
      '1/4W': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQCF6vcgUA5KRqZhMxhWDg2wAT9NJE_gh5WbPL5hwhSL7JY?download=1',
      'NPN': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQAco-RBkJwcQ4hbFZvd5TwmAfNta5TUM0sdoXVJkGgpQnY?download=1',
      'PNP': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQC-9nWcsqC-SZU6-KrxImhrAakq1L5jSShd2HVTxKau0Rs?download=1'
    };

    const key = Object.keys(imagesMap).find(k => product.Producto.includes(k));
    return key ? imagesMap[key] : 'assets/img/no-image.jpg';
  }
}