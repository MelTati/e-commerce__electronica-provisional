import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private api = '/api/ventas';

  currentCartId = signal<number | null>(null);

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem("venta_id");
    if (saved) this.currentCartId.set(Number(saved));
  }

  crearCarrito(telefono: string, id_usuario: number) {
    return this.http.post<any>(this.api, { telefono, id_usuario });
  }

  addProduct(idVenta: number, codigo_producto: number, cantidad: number) {
    return this.http.post(`${this.api}/${idVenta}/productos`, {
      codigo_producto,
      cantidad
    });
  }

  obtenerCarrito(idVenta: number) {
    return this.http.get(`${this.api}/${idVenta}`);
  }

}
