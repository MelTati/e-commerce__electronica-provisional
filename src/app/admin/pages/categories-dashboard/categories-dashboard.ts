import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CategoriesService } from '../../../services/categories.service';
import { CategoriesListInterface } from '../../../interfaces/categories.list.interface';
import { ActionButtonsComponent } from '../../shared/action-buttons/action-buttons';

@Component({
  selector: 'app-categories-dashboard',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatToolbarModule, ActionButtonsComponent],
  templateUrl: './categories-dashboard.html',
  styleUrls: ['./categories-dashboard.css']
})
export class CategoriesDashboardComponent implements OnInit {

  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'acciones'];
  dataSource: CategoriesListInterface[] = [];

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriesService.getCategories().subscribe({
      next: (categorias) => {
        this.dataSource = categorias; 
      },
      error: (err) => {
        console.error('Error cargando categorías:', err);
      }
    });
  }

  editarCategoria(categoria: CategoriesListInterface) {
    console.log('Editar categoría:', categoria);
  }

  eliminarCategoria(categoria: CategoriesListInterface) {
    console.log('Eliminar categoría:', categoria);
  }
}
