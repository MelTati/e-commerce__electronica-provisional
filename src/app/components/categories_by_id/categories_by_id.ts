import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CategoriesXProductService } from '../../services/categories_x_product.service';
import { CategoriesXProductDTO } from '../../interfaces/categories_x_product.interface';

@Component({
  selector: 'app-products-by-category',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './categories_by_id.html',
  styleUrls: ['./categories_by_id.css'],
})
export class CategoriaPage implements OnInit {

  productos = signal<CategoriesXProductDTO[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private service: CategoriesXProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
    console.log('Añadiendo al carrito:', product);
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

}
