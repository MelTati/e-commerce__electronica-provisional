// src/app/components/admin/admin-consultas/admin-consultas.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { ConsultasService } from '../../../services/admin-consulta.service';
import { Consulta } from '../../../interfaces/consulta.interface';

@Component({
  selector: 'app-admin-consultas',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    DatePipe
  ],
  templateUrl: './consulta-admin.html',
  styleUrls: ['./consulta-admin.css'],
})

export class AdminConsultas implements OnInit {

  consultas: Consulta[] = [];
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' = 'success';
  isLoading = false;

  constructor(
    private consultasService: ConsultasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerConsultas();
  }

  obtenerConsultas(): void {
    this.isLoading = true;
    this.consultasService.getConsultas().subscribe({
      next: (consultas) => {
        this.consultas = consultas;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mostrarAlerta(`❌ Error al cargar las consultas: ${err.message || 'Error desconocido'}`, 'error');
        this.isLoading = false;
      }
    });
  }

  eliminarConsulta(idConsulta: number): void {
    if (confirm(`¿Estás seguro de que quieres ELIMINAR la consulta #${idConsulta}?`)) {
      this.consultasService.eliminarConsulta(idConsulta).subscribe({
        next: () => {
          this.mostrarAlerta('✅ Consulta eliminada correctamente.', 'success');
          this.obtenerConsultas();
        },
        error: (err) => {
          this.mostrarAlerta(`❌ No se pudo eliminar la consulta: ${err.error?.mensaje || err.message || 'Error en la eliminación'}`, 'error');
        }
      });
    }
  }

  private mostrarAlerta(msg: string, type: 'success' | 'error'): void {
    this.mensaje = msg;
    this.tipoMensaje = type;
    setTimeout(() => (this.mensaje = ''), 3000);
  }
}