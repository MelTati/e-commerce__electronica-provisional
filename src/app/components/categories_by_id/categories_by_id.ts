import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// Angular Material
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
export class CategoriaPage {

  productos = signal<CategoriesXProductDTO[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private service: CategoriesXProductService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const categoriaId = Number(params.get('id'));
      this.cargarProductos(categoriaId);
    });
  }

  cargarProductos(id: number) {
    this.loading.set(true);

    this.service.getCategoriesXProduct(id).subscribe({
      next: (data) => {
        this.productos.set(data);

        // Para UX suave
        setTimeout(() => {
          this.loading.set(false);
        }, 400);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.loading.set(false);
      }
    });
  }

  addToCart(product: CategoriesXProductDTO) {
    console.log('Añadiendo al carrito:', product);
  }

  openQuickView(id: number) {
    console.log('Vista rápida de:', id);
  }
}
