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
    if (this.cantidad() > 1) {
      this.cantidad.update(v => v - 1);
    }
  }


  setMainImage(index: number) {
    this.selectedIndex.set(index);
    this.selectedImage.set(this.galleryImages()[index]);
  }

  prevImage() {
    const idx = this.selectedIndex();
    const total = this.galleryImages().length;
    const newIndex = idx === 0 ? total - 1 : idx - 1;
    this.setMainImage(newIndex);
  }

  nextImage() {
    const idx = this.selectedIndex();
    const total = this.galleryImages().length;
    const newIndex = idx === total - 1 ? 0 : idx + 1;
    this.setMainImage(newIndex);
  }

  openLightbox() {
    this.showLightbox.set(true);
  }

  closeLightbox() {
    this.showLightbox.set(false);
  }

  // Swipe para móvil
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

  createLens() {
    if (!this.lens || !this.result || !this.mainImage) return;

    this.lens.nativeElement.style.display = "block";
    this.result.nativeElement.style.display = "block";

    const cx = this.result.nativeElement.offsetWidth / this.lens.nativeElement.offsetWidth;
    const cy = this.result.nativeElement.offsetHeight / this.lens.nativeElement.offsetHeight;

    this.result.nativeElement.style.backgroundImage = `url(${this.selectedImage()})`;
    this.result.nativeElement.style.backgroundSize =
      `${this.mainImage.nativeElement.width * cx}px ${this.mainImage.nativeElement.height * cy}px`;
  }

  moveLens(e: MouseEvent) {
    if (!this.lens || !this.result || !this.mainImage) return;

    const pos = this.getCursorPos(e);
    let x = pos.x - this.lens.nativeElement.offsetWidth / 2;
    let y = pos.y - this.lens.nativeElement.offsetHeight / 2;

    const maxX = this.mainImage.nativeElement.width - this.lens.nativeElement.offsetWidth;
    const maxY = this.mainImage.nativeElement.height - this.lens.nativeElement.offsetHeight;

    if (x > maxX) x = maxX;
    if (x < 0) x = 0;
    if (y > maxY) y = maxY;
    if (y < 0) y = 0;

    this.lens.nativeElement.style.left = x + "px";
    this.lens.nativeElement.style.top = y + "px";

    const cx = this.result.nativeElement.offsetWidth / this.lens.nativeElement.offsetWidth;
    const cy = this.result.nativeElement.offsetHeight / this.lens.nativeElement.offsetHeight;

    this.result.nativeElement.style.backgroundPosition =
      `-${x * cx}px -${y * cy}px`;
  }

  removeLens() {
    if (!this.lens || !this.result) return;
    this.lens.nativeElement.style.display = "none";
    this.result.nativeElement.style.display = "none";
  }

  getCursorPos(e: MouseEvent) {
    const rect = this.mainImage.nativeElement.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  addToCart(codigo: number) {
    const prod = this.product();
    if (!prod) return;

    let idVenta = this.cartService.currentCartId();

    if (!idVenta) {
      this.cartService.crearCarrito("9611234567", 1).subscribe({
        next: (res) => {
          idVenta = res.idventas;

          this.cartService.currentCartId.set(idVenta!);
          localStorage.setItem("venta_id", String(idVenta));

          this.guardarProducto(idVenta!, codigo);
        },
        error: () => {
          this.snack.open('No se pudo crear el carrito', 'Cerrar', { duration: 2500 });
        }
      });

      return;
    }

    this.guardarProducto(idVenta, codigo);
  }

  private guardarProducto(idVenta: number, codigo: number) {
    this.cartService.addProduct(idVenta, codigo, this.cantidad()).subscribe({
      next: () => {
        this.snack.open('Producto agregado al carrito', 'Cerrar', { duration: 2000 });
        this.router.navigate(['/carrito']);
      },
      error: () => {
        this.snack.open('Error al agregar', 'Cerrar', { duration: 2500 });
      }
    });
  }

}
