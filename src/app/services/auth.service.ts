import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAdminLoggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isAdminLoggedIn$ = this._isAdminLoggedIn.asObservable();

  constructor() {}

  private hasToken(): boolean {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    return !!token && rol === 'admin';
  }

  updateStatus(): void {
    this._isAdminLoggedIn.next(this.hasToken());
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('adminId');
    this.updateStatus();
  }
}
