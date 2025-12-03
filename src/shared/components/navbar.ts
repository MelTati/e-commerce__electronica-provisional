import { Component, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CategoriesService } from '../../app/services/categories.service';
import { CategoriesListInterface } from '../../app/interfaces/categories.list.interface';
import { AuthService } from '../../app/services/auth.service';

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
  isClientLogged = signal(false);
  isAdminLogged = signal(false);

  constructor(
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data) => this.categories.set(data)
    });

    this.authService.isClientLoggedIn$.subscribe(v => this.isClientLogged.set(v));
    this.authService.isAdminLoggedIn$.subscribe(v => this.isAdminLogged.set(v));
  }

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToAdminProfile() {
    this.router.navigate(['/admin/perfil-admin']);
  }

  trackById(index: number, item: CategoriesListInterface) {
    return item.id_categorias;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const menu = document.querySelector('.header__categories');
    const hamburger = document.querySelector('.header__hamburger');

    if (
      menu && hamburger &&
      !menu.contains(event.target as Node) &&
      !hamburger.contains(event.target as Node)
    ) {
      this.closeMenu();
    }
  }
}
