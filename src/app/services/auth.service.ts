import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isBrowser: boolean = false;

  private _isAdminLoggedIn = new BehaviorSubject<boolean>(false);
  isAdminLoggedIn$ = this._isAdminLoggedIn.asObservable();

  private _isClientLoggedIn = new BehaviorSubject<boolean>(false);
  isClientLoggedIn$ = this._isClientLoggedIn.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this._isAdminLoggedIn.next(this.isAdmin());
      this._isClientLoggedIn.next(this.isClient());
    }
  }

  private isAdmin(): boolean {
    if (!this.isBrowser) return false;
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    return !!token && rol === 'admin';
  }

  private isClient(): boolean {
    if (!this.isBrowser) return false;
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    return !!token && rol === 'cliente';
  }

  getClientData() {
    if (!this.isBrowser) return null;

    const id = localStorage.getItem('clienteId');
    const rol = localStorage.getItem('rol');

    if (!id || rol !== 'cliente') return null;

    return {
      id,
      rol
    };
  }

  updateStatus(): void {
    if (!this.isBrowser) return;
    this._isAdminLoggedIn.next(this.isAdmin());
    this._isClientLoggedIn.next(this.isClient());
  }

  logout(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('adminId');
    localStorage.removeItem('clienteId');

    this.updateStatus();
  }
}
