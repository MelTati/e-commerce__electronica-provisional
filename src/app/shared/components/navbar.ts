import { Component, signal, AfterViewInit } from '@angular/core';
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
export class Navbar implements AfterViewInit {

  categories = signal<CategoriesListInterface[]>([]);

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit() {
    // Cargar categorías desde el servicio
    this.categoriesService.getCategories()
      .subscribe({
        next: (data) => this.categories.set(data),
        error: (err) => console.error('Error cargando categorías:', err)
      });
  }

  ngAfterViewInit() {
    // Menú hamburguesa responsivo
    const hamburger = document.querySelector<HTMLButtonElement>('.header__hamburger');
    const menu = document.querySelector<HTMLDivElement>('.header__menu');

    hamburger?.addEventListener('click', () => {
      menu?.classList.toggle('active');
    });

    // Cerrar menú si se hace clic fuera
    document.addEventListener('click', (event) => {
      if (!hamburger?.contains(event.target as Node) && !menu?.contains(event.target as Node)) {
        menu?.classList.remove('active');
      }
    });
  }
}
