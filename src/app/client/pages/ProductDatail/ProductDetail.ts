import { Component, OnInit, signal, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductDetailService } from '../../../services/ProductDetail.service';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { ProductDetailDTO } from '../../../interfaces/ProductDetail.interface';
import { switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';


@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './ProductDetail.html',
  styleUrls: ['./ProductDetail.css']
})
export class ProductDetailComponent implements OnInit {
  product = signal<ProductDetailDTO | null>(null);
  isLoading = signal(true);
  productId = signal<number | null>(null);
  cantidad = signal(1);
  selectedIndex = signal(0);
  galleryImages = signal<string[]>([
    'assets/img/no-image.jpg',
    'assets/img/no-image.jpg',
    'assets/img/no-image.jpg'
  ]);
  selectedImage = signal<string>('assets/img/no-image.jpg');

  @ViewChild('mainImage', { static: false }) mainImage!: ElementRef<HTMLImageElement>;
  @ViewChild('lens', { static: false }) lens!: ElementRef<HTMLDivElement>;
  @ViewChild('result', { static: false }) result!: ElementRef<HTMLDivElement>;

  showLightbox = signal(false);
  private touchStartX = 0;
  // Eliminamos: private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private detailService: ProductDetailService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private snack: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Eliminamos: this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Nueva función para manejar el localStorage SÓLO en el navegador.
   * Esto previene el crash de SSR.
   */
  private initializeCartId(): void {
    if (isPlatformBrowser(this.platformId) && !this.cartService.currentCartId()) {
      const storedId = localStorage.getItem('venta_id');
      if (storedId) {
        this.cartService.currentCartId.set(Number(storedId));
      }
    }
  }


  ngOnInit(): void {
    // 🔑 CORRECCIÓN: Llamamos a la función protegida
    this.initializeCartId();

    this.route.paramMap
      .pipe(
        switchMap(params => {
          const id = Number(params.get('id'));
          this.productId.set(id);
          return id ? this.detailService.getProductDetailsById(id) : EMPTY;
        })
      )
      .subscribe({
        next: (data) => {
          this.product.set(data);

          const nombre = data.fldNombre || '';
          const galleryMap: Record<string, string[]> = {
            // ... (Galería de URLs de SharePoint, se mantiene igual)
            '555': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBKyeQ56LvXTJVPHr1BTWNYAS6swzezmNk4DkMeX5c2dYw?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBniBJdV-ThQ6P9zjjhkaLlAcPa7YbsRNAzwZUJwEX7AIc?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQDETcwCIgP9S4Gd_C6SWPPLAe8l86Ad0R6BaUQ0x5-BA9o?download=1'
            ],
            '10uF': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD1nSU8zRXZRZM0RsYyVk40AYCgxajeJlWSrNZ0EyVH3rA?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQAzN5SXuW53TIQ4WPzkh1iSAZpR-1wShDcFqowEU2kW03w?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBCuP7djt1XR5LLuEZq7qu-ATQPQ5sH-YNYciUEDQvodKM?download=1'
            ],
            '100uF': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBxX8M40m94QJfmYzLu7_nUARWbbHrU2ZLMo5D1Q-fB9Kw?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQDhPQnX0CYfTatGt4aPK_NaARIxBUnQqT2rrR9d2odiP1M?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQDURpF00IJ3TZ0J4M52RwI2Ae76UX5xdnGjXChYPcI7TU8?download=1'
            ],
            '1N4007': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDYrodsIvyZRKkvQVvQ7ILaAUqHhSTg7NTxJEp2wDNDkO8?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQA0U0ynqS2dSITCTSjvjwWEATty7DvLJLeXjrx22RjdZ-0?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQA5b64TloIxSbFNDUhk6oxIAdKsP124Rv4FAe-K6OYbdIk?download=1'
            ],
            'LED rojo': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCAmk2l6wRMTZMoDIh1zg4lAbCEMtR2w5m_iI6MahQiDhM?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAElwE9OXH4SLgEsC-fvY1cARQHGPEPat2a4xg0KY7bq8E?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDhsz_bxQiuT5PwOzIRQ0f9AUi_OoLJTQaIyky9DP8poRU?download=1'
            ],
            'LED verde': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBpWyJIy869RoZI6T3RPInUAc1oyOsyrulqytkdAxXTlvU?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQDRToak0TvQS4gqiM4nxnmEAbJOILRY0n2eECg1FkGqtWM?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQASFBNXWYERQ6Q7KhsK1-A4ASuWi29OLobkLo4g-LvvF7M?download=1'
            ],
            '10kΩ': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQA67S2QOfjiSJrnzfqeGbPzAS1JDEK4yDgYEPvGzzFlBgw?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQA5RI6XkE27SLsckfpJAzkIAcBDwqs91rgToaD3UmDFvyI?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQCtztiqse08SphWq1S7iKleARZl6Pgfu84A24geGsQSJZE?download=1'
            ],
            '1/4W': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQCF6vcgUA5KRqZhMxhWDg2wAT9NJE_gh5WbPL5hwhSL7JY?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQAl9YOzAIq2SqVbhftDpre8AeNNEcG6kglEe2m90wfR2Ro?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBb6MIOkk_sR5nrXwz4HjnFAagZZrpj_P2JACD9gwF5jN4?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQA1Q0vhujRET5siQYB2-YwZAZCn99-UaE5VNPRgp6YF9R0?download=1'
            ],
            'NPN': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQAco-RBkJwcQ4hbFZvd5TwmAfNta5TUM0sdoXVJkGgpQnY?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQCXa8Q5_gTGSpDb95juVojAASuUCHCc9FxzAmCr1CAWYOM?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQDmNxpDmPbnR74-vaDjLnI2AZeWEiWH9WMkEj46XLNz5bc?download=1'
            ],
            'PNP': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQC-9nWcsqC-SZU6-KrxImhrAakq1L5jSShd2HVTxKau0Rs?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBLlY8KdGQrQ6kP48A6a6ySAUdpr4M1KHYGWrutEderipM?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQCj618xQxHeRp-Ys-hOZHYcAdy9y3tkLhQaFextQ8zoxj4?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD4nS0COaVVQZ2kfbv4ANdkAeLh-2423ziSrzN3eNGQNaI?download=1'
            ]
          };

          const selectedGalleryKey = Object.keys(galleryMap).find(key => nombre.includes(key));
          this.galleryImages.set(selectedGalleryKey ? galleryMap[selectedGalleryKey] : [
            'assets/img/no-image.jpg',
            'assets/img/no-image.jpg',
            'assets/img/no-image.jpg'
          ]);

          this.selectedIndex.set(0);
          this.selectedImage.set(this.galleryImages()[0]);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.snack.open('Error cargando producto', 'Cerrar', { duration: 2500 });
        }
      });
  }

  incrementCantidad() {
    if (this.product() && this.cantidad() < this.product()!.unidades) {
      this.cantidad.update(v => v + 1);
    }
  }

  decrementCantidad() {
    if (this.cantidad() > 1) this.cantidad.update(v => v - 1);
  }

  setMainImage(index: number) {
    this.selectedIndex.set(index);
    this.selectedImage.set(this.galleryImages()[index]);
  }

  prevImage() {
    const idx = this.selectedIndex();
    const total = this.galleryImages().length;
    this.setMainImage(idx === 0 ? total - 1 : idx - 1);
  }

  nextImage() {
    const idx = this.selectedIndex();
    const total = this.galleryImages().length;
    this.setMainImage(idx === total - 1 ? 0 : idx + 1);
  }

  openLightbox() { this.showLightbox.set(true); }
  closeLightbox() { this.showLightbox.set(false); }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.changedTouches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(e: TouchEvent) {
    const end = e.changedTouches[0].clientX;
    if (end < this.touchStartX - 50) this.nextImage();
    if (end > this.touchStartX + 50) this.prevImage();
  }

  // --- Lógica de Zoom (Mantenida, depende de ElementRef) ---
  createLens() {
    if (!isPlatformBrowser(this.platformId)) return; // Aseguramos que solo corre en el navegador
    if (!this.lens || !this.result || !this.mainImage) return;

    // ... (rest of createLens logic)
    const lensEl = this.lens.nativeElement;
    const resultEl = this.result.nativeElement;
    const imgEl = this.mainImage.nativeElement;
    lensEl.style.display = "block";
    resultEl.style.display = "block";
    const cx = resultEl.offsetWidth / lensEl.offsetWidth;
    const cy = resultEl.offsetHeight / lensEl.offsetHeight;
    resultEl.style.backgroundImage = `url(${this.selectedImage()})`;
    resultEl.style.backgroundSize = `${imgEl.width * cx}px ${imgEl.height * cy}px`;
  }

  moveLens(e: MouseEvent) {
    if (!isPlatformBrowser(this.platformId)) return; // Aseguramos que solo corre en el navegador
    if (!this.lens || !this.result || !this.mainImage) return;

    // ... (rest of moveLens logic)
    const pos = this.getCursorPos(e);
    let x = pos.x - this.lens.nativeElement.offsetWidth / 2;
    let y = pos.y - this.lens.nativeElement.offsetHeight / 2;
    const maxX = this.mainImage.nativeElement.width - this.lens.nativeElement.offsetWidth;
    const maxY = this.mainImage.nativeElement.height - this.lens.nativeElement.offsetHeight;
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    this.lens.nativeElement.style.left = x + "px";
    this.lens.nativeElement.style.top = y + "px";
    const cx = this.result.nativeElement.offsetWidth / this.lens.nativeElement.offsetWidth;
    const cy = this.result.nativeElement.offsetHeight / this.lens.nativeElement.offsetHeight;
    this.result.nativeElement.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
  }

  removeLens() {
    if (!isPlatformBrowser(this.platformId)) return; // Aseguramos que solo corre en el navegador
    if (!this.lens || !this.result) return;
    this.lens.nativeElement.style.display = "none";
    this.result.nativeElement.style.display = "none";
  }

  getCursorPos(e: MouseEvent) {
    const rect = this.mainImage.nativeElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  // --- Fin Lógica de Zoom ---


  addToCart(codigo_producto: number) {
    const prod = this.product();
    if (!prod) return;

    const clientData = this.authService.getClientData();

    if (!clientData) {
      this.snack.open('Debes iniciar sesión para agregar productos al carrito', 'Iniciar sesión', {
        duration: 5000
      }).onAction().subscribe(() => {
        this.router.navigate(['/login']);
      });

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
            localStorage.setItem("venta_id", String(res.idventas));
          }

          this.addOrUpdateProduct(res.idventas, codigo_producto);
        },
        error: (error) => {
          console.error('Error al crear carrito:', error);
          this.snack.open('No se pudo crear el carrito', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.addOrUpdateProduct(idventas, codigo_producto);
    }
  }

  private addOrUpdateProduct(idventas: number, codigo_producto: number) {
    this.cartService.addOrUpdateProduct(idventas, codigo_producto, this.cantidad()).subscribe({
      next: () => {
        this.snack.open('¡Producto agregado al carrito!', 'Ver carrito', { duration: 3000 })
          .onAction().subscribe(() => this.router.navigate(['/carrito']));

        setTimeout(() => this.router.navigate(['/carrito']), 300);
      },
      error: (err) => {
        console.error('Error al agregar al carrito:', err);
        this.snack.open('Error al agregar el producto', 'Cerrar', { duration: 3000 });
      }
    });
  }
}