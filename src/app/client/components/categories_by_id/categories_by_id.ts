import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
  // Eliminamos la variable private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private service: CategoriesXProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private snack: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object // Inyección de la plataforma
  ) {
    // El constructor queda limpio.
  }

  ngOnInit(): void {
    // 🔑 Mover la lógica de localStorage
    this.initializeCartId();

    this.route.paramMap.subscribe(params => {
      const categoriaId = Number(params.get('id'));
      if (!isNaN(categoriaId)) {
        this.cargarProductos(categoriaId);
      } else {
        this.productos.set([]);
        this.loading.set(false);
      }
    });
  }

  /**
   * Nueva función para manejar el localStorage SÓLO en el navegador.
   * Esto previene el crash de SSR.
   */
  private initializeCartId(): void {
    // 🔑 Usamos la función isPlatformBrowser() directamente
    if (isPlatformBrowser(this.platformId) && !this.cartService.currentCartId()) {
      const storedId = localStorage.getItem('venta_id');
      if (storedId) {
        this.cartService.currentCartId.set(Number(storedId));
      }
    }
  }

  cargarProductos(id: number): void {
    this.loading.set(true);
    this.service.getCategoriesXProduct(id).subscribe({
      next: (data: CategoriesXProductDTO[]) => {
        this.productos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.productos.set([]);
        this.loading.set(false);
        this.snack.open('Error al cargar los productos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  addToCart(product: CategoriesXProductDTO): void {
    const clientData = this.authService.getClientData();

    if (!clientData) {
      this.snack.open('Debes iniciar sesión para agregar al carrito', 'Iniciar sesión', { duration: 5000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      this.router.navigate(['/login']);
      return;
    }

    const telefonoCliente = clientData.id;
    const idventas = this.cartService.currentCartId();

    if (!idventas) {
      this.cartService.crearCarrito(telefonoCliente, 1).subscribe({
        next: (res) => {
          this.cartService.currentCartId.set(res.idventas);

          // 🔑 CORRECCIÓN: Usamos la función isPlatformBrowser() directamente
          if (isPlatformBrowser(this.platformId)) {
             localStorage.setItem('venta_id', String(res.idventas));
          }

          this.addOrUpdateProduct(res.idventas, product.codigo_producto);
        },
        error: () => this.snack.open('No se pudo crear el carrito', 'Cerrar', { duration: 3000 })
      });
    } else {
      this.addOrUpdateProduct(idventas, product.codigo_producto);
    }
  }

  private addOrUpdateProduct(idventas: number, codigo_producto: number) {
    this.cartService.addOrUpdateProduct(idventas, codigo_producto, 1).subscribe({
      next: () => {
        this.snack.open('Producto agregado al carrito', 'Ver carrito', { duration: 3000 })
          .onAction().subscribe(() => this.router.navigate(['/carrito']));
        setTimeout(() => this.router.navigate(['/carrito']), 300);
      },
      error: () => this.snack.open('Error al agregar el producto', 'Cerrar', { duration: 3000 })
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
      'Seguro de Daños accidentales $5000 - $5999.99': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQD3dKjPOQ-9T5kSxSp5MXDAASNemxioCkfH1dRXc9PBIfo?download=1',
      'Torre Regleta Multicontacto Pared con 1700J Protector contra Sobretensión': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAT6YVLxFxaRpeVTtws0EGUAUXflN8wxM54EaCSnluclzM?download=1',
      'Mouse inalámbrico M280 Logitech': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQACQkJLGr46SYRsnLcSTqHQAcI58h0TPSAtETyBV-k9TCo?download=1',
      'Interruptores táctiles fijos de 6 x 6':'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCAz0wOnMLlTo5vMH3w5SfYAVvqQ9qsw9s2Jx9emgthCkE?download=1',
      'Condensador 100µF 16V':'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD1nSU8zRXZRZM0RsYyVk40AYCgxajeJlWSrNZ0EyVH3rA?download=1',
      'Condensador 10µF 16V': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBxX8M40m94QJfmYzLu7_nUARWbbHrU2ZLMo5D1Q-fB9Kw?download=1',
      'Resistor 1kΩ 1/4W': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQCF6vcgUA5KRqZhMxhWDg2wAT9NJE_gh5WbPL5hwhSL7JY?download=1',
      'Circuito integrado 555 Timer':'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBKyeQ56LvXTJVPHr1BTWNYAS6swzezmNk4DkMeX5c2dYw?download=1',
      'Diodo rectificador 1N4007': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDYrodsIvyZRKkvQVvQ7ILaAUqHhSTg7NTxJEp2wDNDkO8?download=1',
      'Probador inteligente de dispositivos montaje superficial':'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAsb6cBGEFVQbCUzlev9iamAfvx9SO1PVjP9pD18Ph4rD0?download=1',
      'Transistor NPN BC547':'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQAco-RBkJwcQ4hbFZvd5TwmAfNta5TUM0sdoXVJkGgpQnY?download=1',
      'Transistor PNP BC558': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQC-9nWcsqC-SZU6-KrxImhrAakq1L5jSShd2HVTxKau0Rs?download=1',
      'Comprobador de transistores LCR-P1': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBo8nLg_ZAsSo4QTvyRXkQgAYeVfDpy_9y-R5w35cMoNSE?download=1',
      'LED rojo 5mm': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCAmk2l6wRMTZMoDIh1zg4lAbCEMtR2w5m_iI6MahQiDhM?download=1',
      'LED verde 5mm': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBpWyJIy869RoZI6T3RPInUAc1oyOsyrulqytkdAxXTlvU?download=1',
      'Pluma de succión al vacío duradera':'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQD154bnSJgGQ7yvlqS5HRQuARZ5r9_mlURtyg_gb8odJbs?download=1',
      'Resistor 10kΩ 1/4W': 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQCF6vcgUA5KRqZhMxhWDg2wAT9NJE_gh5WbPL5hwhSL7JY?download=1',
      'Kit Básico de Componentes Electrónicos Completo':'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQA9oRc1rvINSqdxg9v0GomdAbjVIRsjnEgH3-8_FTTV_GQ?download=1',
      'Cargador avanzado de baterías individuales con pilas recargables':'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQClKSpfJSeXSpPpYl37S3LTAaTRhcasnsuIUmG5Ku-HTkY?download=1',
      'Logitech ERGO K860 Teclado partido': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDx1BQM6VFXQqswLESjbc3zAc9KsNXLm312pmOhVSQk5_Y?download=1',
      '11 Tweezers y Pinzas de Precisión ESD Antiestáticas': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQALQC9Y1iF_T6NTMkfMT136AejSip9r6_FXiqMl7F9qGu4?download=1',
      'Medidor de energía inteligente controlado por wifi': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBPw1Zki1IzSJDeVbBQg5-hAfKVnn8zzwv1vAcuKarwE9U?download=1',
      'REGULADOR RS-1410': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBMLdCFj5WCQbJsxfDtgMqBAUqLTfakiC0QGzj8liQdqtI?download=1',
     'Tarjeta De Desarrollo Pic18f45k50':'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAmdFYSk68LR4cluXQ37FPIATesRrgiu5KnoVfhEMoSLBE?download=1',
     'Tarjeta De Desarrollo Uno R3 Dip Compatible Ide Arduino + Cable Usb Qyj' : 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQA_FDJbMqOxSJYiGYR2z0uGATssgoZnYYGSMtrnGejIihQ?download=1',
      'Sensor MQ135 DE Calidad DE Aire': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBpr4CMObyPT7XU40Pxfs2SAT5txIpz6UDGUB5wooIonQE?download=1',
      'Sensor Ultrasonico HC-SR04 Compatible con Arduino':'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQC9fmT9ZR7UQLL9R-3iWBbQAQ-FLg2SiLl1g1uV15Z7-_8?download=1',
      'Módulo Bluetooth inalámbrico HC-05':'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQC3DCa2um2FQ66yT90f7x4LAR0H6uF604p892Vau3xSe1A?download=1',
      'Optoacoplador, 2 unidades PC817 de placa de aislamiento de 4 canales':'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBSMhM7W0snRrrZJsf4k2F9AXiZdCwkX8z58PtcQYP69jg?download=1',
      'Kit Para Armar Smartbot | K-720' : 'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB3podooi4gTpK-SkiB--xcAZTgR11x9cAtf73pjxUDUug?download=1',
      'Kit Robótico de Coche V4.0 Arduino': 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBY4p_9BLfRR4-uBdVULZRbAYdz0V8Tj7VyYHkEIVK49jw?download=1',
      'Lindo Robot Mascota para Niños y Adultos':'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDzZVfXAppuRq8X8LzT1avVAQ2cR_ZPK90OqqvXYPsaQDE?download=1', 
      'UGREEN Hub USB C, 6 en 1 Adaptador Tipo C' : 'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCgsodzssdVT6IIGHDaRL3mAesoG7ArCwt1jAIrPhoX6R8?download=1',
    };  

    const key = Object.keys(imagesMap).find(k => product.Producto.includes(k));
    return key ? imagesMap[key] : 'assets/img/no-image.jpg';
  }
}