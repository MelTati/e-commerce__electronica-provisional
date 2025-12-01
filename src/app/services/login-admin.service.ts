// src/app/services/admin-login.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { LoginDTO } from '../interfaces/login.interface';
import { isPlatformBrowser } from '@angular/common';

export interface AdminLoginResponse {
  id: string;
  nombre: string;
  rol: string;  
  token: string; 
}

@Injectable({
  providedIn: 'root',
})
export class AdminLoginService {
  private readonly loginUrl = '/api/auth/admin/login';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  iniciarSesion(payload: LoginDTO): Observable<AdminLoginResponse> {

    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Login solo disponible en navegador.'));
    }

    return this.http.post<AdminLoginResponse>(this.loginUrl, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        const mensaje =
          error.error?.mensaje ?? 
          error.message ?? 
          'Error desconocido al iniciar sesión';
        return throwError(() => new Error(mensaje));
      })
    );
  }
}
