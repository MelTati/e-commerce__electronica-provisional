import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (token && rol === 'admin') {
      return true;
    }

    this.router.navigate(['/login-admin']);
    return false;
  }
}
