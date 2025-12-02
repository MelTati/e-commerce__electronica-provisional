import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { switchMap, Observable } from 'rxjs';

export interface FinalizarVentaResponse {
  total_pagado: number;
}

export interface CrearCarritoResponse {
  idventas: number;
}

export interface ProductoCarrito {
  idventas: number;
  codigo_producto: number;
  Producto: string;
  Marca: string;
  DetalleDescripcion: string;
  DetalleUnidades: number;
  PrecioUnitario: number;
  cantidad: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private api = '/api/ventas';
  currentCartId = signal<number | null>(null);
  private isBrowser = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Solo acceder a localStorage en el navegador
    if (this.isBrowser) {
      const saved = localStorage.getItem("venta_id");
      if (saved) this.currentCartId.set(Number(saved));
    }
  }

  crearCarrito(telefono: string, id_usuario: number) {
    return this.http.post<CrearCarritoResponse>(this.api, { telefono, id_usuario });
  }

  addProduct(idventas: number, codigo_producto: number, cantidad: number) {
    return this.http.post(`${this.api}/${idventas}/productos`, { codigo_producto, cantidad });
  }

  actualizarProducto(idventas: number, codigo_producto: number, nuevaCantidad: number) {
    return this.http.put(`${this.api}/${idventas}/productos/${codigo_producto}`, {
      nueva_cantidad: nuevaCantidad
    });
  }

  eliminarProducto(idventas: number, codigo_producto: number) {
    return this.http.delete(`${this.api}/${idventas}/productos/${codigo_producto}`);
  }

  obtenerCarrito(idventas: number): Observable<ProductoCarrito[]> {
    return this.http.get<ProductoCarrito[]>(`${this.api}/${idventas}`);
  }

  addOrUpdateProduct(idventas: number, codigo_producto: number, cantidad: number) {
    return this.obtenerCarrito(idventas).pipe(
      switchMap(carrito => {
        const item = carrito.find(p => p.codigo_producto === codigo_producto);
        if (item) {
          const nuevaCantidad = item.cantidad + cantidad;
          return this.actualizarProducto(idventas, codigo_producto, nuevaCantidad);
        }
        return this.addProduct(idventas, codigo_producto, cantidad);
      })
    );
  }

  finalizarVenta(idventas: number, id_tipo_pago: number) {
    return this.http.post<FinalizarVentaResponse>(`${this.api}/${idventas}/finalizar`, {
      id_tipo_pago: Number(id_tipo_pago)
    });
  }

  cancelarVenta(idventas: number) {
    return this.http.put(`${this.api}/${idventas}/cancelar`, {});
  }
}
