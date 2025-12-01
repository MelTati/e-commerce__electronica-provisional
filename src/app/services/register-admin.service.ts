// src/app/services/admin-usuarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { RegisterDTO, AdminUpdateDTO, AdminListDTO } from '../interfaces/register-admin.interface';

@Injectable({
  providedIn: 'root'
})

export class AdminUsuariosService {

  private readonly baseUrl = '/api/admin/usuarios';

  constructor(private http: HttpClient) {}

  private manejarError(error: HttpErrorResponse) {
    const mensaje =
      error.error?.mensaje ??
      error.message ??
      'Error desconocido en la operación de usuarios admin';

    console.error('❌ Error en AdminUsuariosService:', mensaje);
    return throwError(() => new Error(mensaje));
  }

  registrarAdmin(payload: RegisterDTO): Observable<any> {
    console.log('📤 Registrando admin:', payload);

    return this.http.post('/api/auth/admin/registro', payload).pipe(
      catchError((error) => this.manejarError(error))
    );
  }

  listarAdmins(): Observable<AdminListDTO[]> {
    return this.http.get<AdminListDTO[]>(this.baseUrl).pipe(
      catchError((error) => this.manejarError(error))
    );
  }

  actualizarAdmin(id: number, payload: AdminUpdateDTO): Observable<any> {
    console.log(`✏️ Editando admin ${id}:`, payload);

    return this.http.put(`${this.baseUrl}/${id}`, payload).pipe(
      catchError((error) => this.manejarError(error))
    );
  }

 eliminarAdmin(id: number): Observable<void> {
    console.log(`🗑 Eliminando admin ${id}`);

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError((error) => this.manejarError(error))
    );
  }
}
