import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoriesService } from '../../services/categories.service';
import { CategoriesListInterface } from '../../interfaces/categories.list.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})

export class Navbar {

  categories = signal<CategoriesListInterface[]>([]);

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit() {
    this.categoriesService.getCategories()
      .subscribe({
        next: (data) => this.categories.set(data),
        error: (err) => console.error('Error cargando categorías:', err)
      });
  }
}