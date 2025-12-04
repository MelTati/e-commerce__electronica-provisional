// dashboard.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminLayout implements OnInit {
  sidebarOpen = false;
  isAdminLoggedIn = false;
  private touchStartX = 0;
  private touchCurrentX = 0;
  private dragging = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.isAdminLoggedIn$.subscribe(status => {
      this.isAdminLoggedIn = status;
      if (!status) this.router.navigate(['/login-admin']);
    });
    this.sidebarOpen = window.innerWidth > 900;
    this.updateHamburgerVisibility();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.updateHamburgerVisibility();
  }

  closeSidebar() {
    if (window.innerWidth <= 900) this.sidebarOpen = false;
    this.updateHamburgerVisibility();
  }

  private updateHamburgerVisibility() {
    const hamburger = document.querySelector('.hamburger');
    if (this.sidebarOpen) {
      hamburger?.classList.add('hidden');
    } else {
      hamburger?.classList.remove('hidden');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login-admin']);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    if (window.innerWidth > 900) return;
    this.touchStartX = e.touches[0].clientX;
    this.touchCurrentX = this.touchStartX;
    this.dragging = true;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e: TouchEvent) {
    if (!this.dragging) return;
    this.touchCurrentX = e.touches[0].clientX;
    const delta = this.touchCurrentX - this.touchStartX;

    if (!this.sidebarOpen && this.touchStartX < 50 && delta > 40) {
      this.sidebarOpen = true;
      this.dragging = false;
      this.updateHamburgerVisibility();
    }

    if (this.sidebarOpen && delta < -40) {
      this.sidebarOpen = false;
      this.dragging = false;
      this.updateHamburgerVisibility();
    }
  }

  @HostListener('touchend')
  onTouchEnd() {
    this.dragging = false;
    this.touchStartX = 0;
    this.touchCurrentX = 0;
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 900) this.sidebarOpen = true;
    else this.sidebarOpen = false;
    this.updateHamburgerVisibility();
  }
}
