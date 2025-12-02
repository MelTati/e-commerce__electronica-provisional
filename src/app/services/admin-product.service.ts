// src/app/services/admin-productos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ProductoDTO,ProductoCreateDTO,ProductoUpdateDTO,CategoriaDTO} from '../interfaces/product-admin.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminProductosService {

  private readonly baseUrl = '/api/admin/productos';
  private readonly categoriasUrl = '/api/categorias';

  constructor(private http: HttpClient) {}

  private manejarError(error: HttpErrorResponse) {
    const mensaje =
      error.error?.mensaje ??
      error.message ??
      'Error desconocido en la operación de productos';

    return throwError(() => new Error(mensaje));
  }

  listarProductos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>('/api/productos').pipe(
      catchError((err) => this.manejarError(err))
    );
  }

  listarCategorias(): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(this.categoriasUrl).pipe(
      catchError((err) => this.manejarError(err))
    );
  }

  crearProducto(payload: ProductoCreateDTO): Observable<any> {
    return this.http.post(this.baseUrl, payload).pipe(
      catchError((err) => this.manejarError(err))
    );
  }

  actualizarProducto(id: number, payload: ProductoUpdateDTO): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, payload).pipe(
      catchError((err) => this.manejarError(err))
    );
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError((err) => this.manejarError(err))
    );
  }
}
