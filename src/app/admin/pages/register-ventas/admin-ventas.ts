import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { VentasService } from '../../../services/admin-ventas.service';
import { Venta } from '../../../interfaces/venta-admin.interface';

@Component({
  selector: 'app-admin-ventas',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './admin-ventas.html',
  styleUrls: ['./admin-ventas.css'],
})
export class AdminVentas implements OnInit {

  ventas: Venta[] = [];
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' = 'success';
  isLoading = false;

  constructor(
    private ventasService: VentasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerVentas();
  }

  // Listar todas las ventas
  obtenerVentas(): void {
    this.isLoading = true;
    this.ventasService.getVentas().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mostrarAlerta(`❌ Error al cargar ventas: ${err.message || err}`, 'error');
        this.isLoading = false;
      }
    });
  }

  // Cancelar una venta directamente
  cancelarVenta(idventas: number): void {
    if (confirm(`¿Deseas cancelar la venta #${idventas}?`)) {
      this.ventasService.cancelarVenta(idventas).subscribe({
        next: () => {
          this.mostrarAlerta('✅ Venta cancelada correctamente.', 'success');
          this.obtenerVentas();
        },
        error: (err) => {
          this.mostrarAlerta(`❌ No se pudo cancelar la venta: ${err.error?.mensaje || err.message}`, 'error');
        }
      });
    }
  }

  // Mostrar alertas
  private mostrarAlerta(msg: string, type: 'success' | 'error'): void {
    this.mensaje = msg;
    this.tipoMensaje = type;
    setTimeout(() => (this.mensaje = ''), 3000);
  }
}
