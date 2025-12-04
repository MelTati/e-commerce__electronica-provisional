import { Component, OnInit } from '@angular/core';
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

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.isAdminLoggedIn$.subscribe(status => {
      this.isAdminLoggedIn = status;
      if (!status) {
        this.router.navigate(['/login-admin']);
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    if (window.innerWidth <= 900) {
      this.sidebarOpen = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login-admin']);
  }
}
