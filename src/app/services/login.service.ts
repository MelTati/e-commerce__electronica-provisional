// src/app/services/register.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { LoginDTO } from '../interfaces/login.interface'; 

@Injectable({
  providedIn: 'root'
})

export class loginService {

  private readonly loginUrl = '/api/auth/login';

  constructor(private http: HttpClient) {}

  iniciarSesion(payload: LoginDTO): Observable<any> {
    console.log('📤 Enviando login de cliente:', payload);

    return this.http.post(this.loginUrl, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        const mensaje =
          error.error?.mensaje ??
          error.message ??
          'Error desconocido al iniciar sesión';

        console.error('❌ Error en iniciarSesion():', mensaje);
        return throwError(() => new Error(mensaje));
      })
    );
  }
}
