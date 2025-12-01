import { Component, signal, OnInit, HostListener } from '@angular/core';
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
export class Navbar implements OnInit {

  categories = signal<CategoriesListInterface[]>([]);
  menuOpen = signal(false);

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error cargando categorías:', err)
    });
  }

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const menu = document.querySelector('.header__menu');
    const hamburger = document.querySelector('.header__hamburger');

    if (
      menu && hamburger &&
      !menu.contains(event.target as Node) &&
      !hamburger.contains(event.target as Node)
    ) {
      this.closeMenu();
    }
  }

  trackById(index: number, item: CategoriesListInterface) {
    return item.id_categorias;
  }
}
