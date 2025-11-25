
import { Component, OnInit, HostListener, ElementRef, ViewChild, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductDetailService } from '../../services/ProductDetail.service';
import { ProductDetailDTO } from '../../interfaces/ProductDetail.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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

  // Signals
  productId = signal<number | null>(null);
  product = signal<ProductDetailDTO | null>(null);
  isLoading = signal(true);
  selectedImage = signal('assets/img/no-image.jpg');
  selectedIndex = signal(0);
  showLightbox = signal(false);
  cantidad = signal(1);

  galleryImages = signal<string[]>([
    'assets/img/no-image.jpg',
    'assets/img/no-image.jpg',
    'assets/img/no-image.jpg'
  ]);

  @ViewChild('lens') zoomLens!: ElementRef<HTMLDivElement>;
  @ViewChild('result') zoomResult!: ElementRef<HTMLDivElement>;
  @ViewChild('mainImage') mainImage!: ElementRef<HTMLImageElement>;

  private touchStartX = 0;

  constructor(
    private detailService: ProductDetailService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const id = Number(params.get('id'));
          if (id) {
            this.resetState();
            this.productId.set(id);
            return this.detailService.getProductDetailsById(id);
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: (data: ProductDetailDTO) => {
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
        error: () => this.isLoading.set(false)
      });
  }

  resetState(): void {
    this.product.set(null);
    this.isLoading.set(true);
    this.selectedIndex.set(0);
    this.selectedImage.set(this.galleryImages()[0]);
    this.cantidad.set(1);
    this.showLightbox.set(false);
  }

  setMainImage(index: number): void {
    this.selectedIndex.set(index);
    this.selectedImage.set(this.galleryImages()[index]);
  }

  nextImage(): void {
    const newIndex = (this.selectedIndex() + 1) % this.galleryImages().length;
    this.selectedIndex.set(newIndex);
    this.selectedImage.set(this.galleryImages()[newIndex]);
  }

  prevImage(): void {
    const newIndex = (this.selectedIndex() - 1 + this.galleryImages().length) % this.galleryImages().length;
    this.selectedIndex.set(newIndex);
    this.selectedImage.set(this.galleryImages()[newIndex]);
  }

  openLightbox(): void {
    this.showLightbox.set(true);
  }

  closeLightbox(): void {
    this.showLightbox.set(false);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    const endX = event.changedTouches[0].clientX;
    if (endX < this.touchStartX - 50) this.nextImage();
    if (endX > this.touchStartX + 50) this.prevImage();
  }

  // Zoom
  createLens(): void {
    if (!this.zoomLens || !this.zoomResult) return;
    this.zoomResult.nativeElement.style.backgroundImage = `url('${this.selectedImage()}')`;
    this.zoomResult.nativeElement.style.display = 'block';
    this.zoomLens.nativeElement.style.display = 'block';
  }

  moveLens(e: MouseEvent): void {
    if (!this.zoomLens || !this.zoomResult || !this.mainImage) return;

    const img = this.mainImage.nativeElement;
    const lens = this.zoomLens.nativeElement;
    const result = this.zoomResult.nativeElement;

    const rect = img.getBoundingClientRect();
    const posX = e.clientX - rect.left - lens.offsetWidth / 2;
    const posY = e.clientY - rect.top - lens.offsetHeight / 2;

    lens.style.left = `${posX}px`;
    lens.style.top = `${posY}px`;

    const cx = result.offsetWidth / lens.offsetWidth;
    const cy = result.offsetHeight / lens.offsetHeight;

    result.style.backgroundSize = `${img.width * cx}px ${img.height * cy}px`;
    result.style.backgroundPosition = `-${posX * cx}px -${posY * cy}px`;
  }

  removeLens(): void {
    if (!this.zoomResult || !this.zoomLens) return;
    this.zoomLens.nativeElement.style.display = 'none';
    this.zoomResult.nativeElement.style.display = 'none';
  }

  incrementCantidad(): void {
    if (this.product() && this.cantidad() < this.product()!.unidades) {
      this.cantidad.update(c => c + 1);
    } else if (!this.product()) {
      this.cantidad.update(c => c + 1);
    }
  }

  decrementCantidad(): void {
    if (this.cantidad() > 1) this.cantidad.update(c => c - 1);
  }

  addToCart(): void {
    if (!this.product()) return;
    this.snackBar.open(`Agregado: ${this.product()!.fldNombre} x${this.cantidad()}`, 'Cerrar', {
      duration: 3000
    });
  }
}
