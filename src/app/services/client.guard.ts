import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClientGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (token && rol === 'cliente') {
      return true;
    }

    this.router.navigate(['/login-cliente']);
    return false;
  }
}
