import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})

export class Cart implements OnInit {

  detalles = signal<any[]>([]);
  isLoading = signal(true);

  constructor(private cart: CartService) {}

  ngOnInit(): void {
    const idVenta = this.cart.currentCartId();

    if (!idVenta) return;

    this.cart.obtenerCarrito(idVenta).subscribe({
      next: (res: any) => {
        this.detalles.set(res);
        this.isLoading.set(false);
      }
    });
  }

  get total() {
    return this.detalles().reduce((acc, item) => acc + item.subtotal, 0);
  }
}
