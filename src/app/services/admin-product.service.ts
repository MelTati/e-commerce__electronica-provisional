// src/app/services/admin-productos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { 
  ProductoDTO,       // Para listado
  ProductoCreateDTO, // Para crear
  ProductoUpdateDTO  // Para actualizar
} from '../interfaces/product-admin.interface';

@Injectable({
  providedIn: 'root'
})

export class AdminProductosService {

  private readonly baseUrl = '/api/admin/productos';

  constructor(private http: HttpClient) {}

  private manejarError(error: HttpErrorResponse) {
    const mensaje =
      error.error?.mensaje ??
      error.message ??
      'Error desconocido en la operación de productos';

    console.error('❌ Error en AdminProductosService:', mensaje);
    return throwError(() => new Error(mensaje));
  }

  // LISTAR PRODUCTOS (admin)
  listarProductos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>('/api/productos').pipe(
      catchError((err) => this.manejarError(err))
    );
  }

  // CREAR PRODUCTO COMPLETO (admin)
  crearProducto(payload: ProductoCreateDTO): Observable<any> {
    console.log('📤 Creando producto:', payload);

    return this.http.post(this.baseUrl, payload).pipe(
      catchError((err) => this.manejarError(err))
    );
  }

  // ACTUALIZAR PRODUCTO (admin)
  actualizarProducto(id: number, payload: ProductoUpdateDTO): Observable<any> {
    console.log(`✏️ Editando producto ${id}:`, payload);

    return this.http.put(`${this.baseUrl}/${id}`, payload).pipe(
      catchError((err) => this.manejarError(err))
    );
  }

  // ELIMINAR PRODUCTO (admin)
  eliminarProducto(id: number): Observable<void> {
    console.log(`🗑 Eliminando producto ${id}`);

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError((err) => this.manejarError(err))
    );
  }
}
