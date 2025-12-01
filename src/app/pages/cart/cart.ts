import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, ProductoCarrito } from '../../services/cart.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})

export class Cart implements OnInit {

  detalles = signal<ProductoCarrito[]>([]);
  isLoading = signal(true);
  tipoPago = signal<number>(1);

  constructor(private cartService: CartService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.loadCarrito();
  }

  private loadCarrito() {
    const idVentas = this.cartService.currentCartId();
    if (!idVentas) {
      this.isLoading.set(false);
      return;
    }

    this.cartService.obtenerCarrito(idVentas).subscribe({
      next: res => {
        this.detalles.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.detalles.set([]);
        this.isLoading.set(false);
        this.snack.open('Error cargando el carrito', 'Cerrar', { duration: 2500 });
      }
    });
  }

  get total(): number {
    return this.detalles().reduce((acc, item) => acc + Number(item.subtotal), 0);
  }

  // ------------------ CANTIDAD ------------------
  incrementar(item: ProductoCarrito) {
    const idVentas = this.cartService.currentCartId();
    if (!idVentas) return;

    if (item.cantidad < item.DetalleUnidades) {
      const nuevaCantidad = item.cantidad + 1;
      this.cartService.actualizarProducto(idVentas, item.codigo_producto, nuevaCantidad).subscribe({
        next: () => this.loadCarrito(),
        error: () => this.snack.open('No se pudo actualizar la cantidad', 'Cerrar', { duration: 2500 })
      });
    }
  }

  decrementar(item: ProductoCarrito) {
    const idVentas = this.cartService.currentCartId();
    if (!idVentas) return;

    if (item.cantidad > 1) {
      const nuevaCantidad = item.cantidad - 1;
      this.cartService.actualizarProducto(idVentas, item.codigo_producto, nuevaCantidad).subscribe({
        next: () => this.loadCarrito(),
        error: () => this.snack.open('No se pudo actualizar la cantidad', 'Cerrar', { duration: 2500 })
      });
    }
  }

  // ------------------ ELIMINAR ------------------
  eliminar(item: ProductoCarrito) {
    const idVentas = this.cartService.currentCartId();
    if (!idVentas) return;

    this.cartService.eliminarProducto(idVentas, item.codigo_producto).subscribe({
      next: () => this.loadCarrito(),
      error: () => this.snack.open('No se pudo eliminar el producto', 'Cerrar', { duration: 2500 })
    });
  }

  // ------------------ FINALIZAR COMPRA ------------------
  finalizarCompra() {
    const idVentas = this.cartService.currentCartId();
    if (!idVentas) return;

    this.cartService.finalizarVenta(idVentas, this.tipoPago()).subscribe({
      next: res => {
        this.snack.open(`Compra finalizada, total pagado: $${res.total_pagado}`, 'Cerrar', { duration: 3500 });
        this.detalles.set([]);
        localStorage.removeItem('venta_id');
        this.cartService.currentCartId.set(null);
      },
      error: () => this.snack.open('Error al finalizar la compra', 'Cerrar', { duration: 2500 })
    });
  }

  // ------------------ CANCELAR VENTA ------------------
  cancelarVenta() {
    const idVentas = this.cartService.currentCartId();
    if (!idVentas) return;

    this.cartService.cancelarVenta(idVentas).subscribe({
      next: () => {
        this.snack.open('Venta cancelada', 'Cerrar', { duration: 2500 });
        this.detalles.set([]);
        localStorage.removeItem('venta_id');
        this.cartService.currentCartId.set(null);
      },
      error: () => this.snack.open('No se pudo cancelar la venta', 'Cerrar', { duration: 2500 })
    });
  }

}
