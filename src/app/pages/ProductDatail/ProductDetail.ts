import { Component, OnInit, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductDetailService } from '../../services/ProductDetail.service';
import { CartService } from '../../services/cart.service';
import { ProductDetailDTO } from '../../interfaces/ProductDetail.interface';
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

  constructor(
    private route: ActivatedRoute,
    private detailService: ProductDetailService,
    private cartService: CartService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
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

          // Reemplazar por imágenes reales si existen
          this.galleryImages.set([
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
  onTouchStart(e: TouchEvent) { this.touchStartX = e.changedTouches[0].clientX; }

  @HostListener('touchend', ['$event'])
  onTouchEnd(e: TouchEvent) {
    const end = e.changedTouches[0].clientX;
    if (end < this.touchStartX - 50) this.nextImage();
    if (end > this.touchStartX + 50) this.prevImage();
  }

  createLens() {
    if (!this.lens || !this.result || !this.mainImage) return;
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
    if (!this.lens || !this.result || !this.mainImage) return;

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
    if (!this.lens || !this.result) return;
    this.lens.nativeElement.style.display = "none";
    this.result.nativeElement.style.display = "none";
  }

  getCursorPos(e: MouseEvent) {
    const rect = this.mainImage.nativeElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  // -------------------- CARRITO --------------------

  addToCart(codigo_producto: number) {
  const prod = this.product();
  if (!prod) return;

  const idventas = this.cartService.currentCartId();

  if (!idventas) {
    this.cartService.crearCarrito("9614309950", 1).subscribe({
      next: (res) => {
        this.cartService.currentCartId.set(res.idventas);
        localStorage.setItem("venta_id", String(res.idventas));
        this.addOrUpdateProduct(res.idventas, codigo_producto);
      },
      error: () => {
        this.snack.open('No se pudo crear el carrito', 'Cerrar', { duration: 2500 });
      }
    });
  } else {
    this.addOrUpdateProduct(idventas, codigo_producto);
  }
}

  private addOrUpdateProduct(idventas: number, codigo_producto: number) {
  this.cartService.addOrUpdateProduct(idventas, codigo_producto, this.cantidad()).subscribe({
    next: () => {
      // Mostrar notificación
      this.snack.open('Producto agregado al carrito', 'Cerrar', { duration: 2000 });
      // Redirigir automáticamente al carrito después de un pequeño delay
      setTimeout(() => {
        this.router.navigate(['/carrito']);
      }, 300); // 300ms para que el snack se vea antes de navegar
    },
    error: () => {
      this.snack.open('Error al agregar el producto', 'Cerrar', { duration: 2500 });
    }
  });
}

}
