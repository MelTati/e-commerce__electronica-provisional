import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AdminClientesService } from '../../../services/register-clientes.service';
import { 
  ClienteListDTO, 
  ClienteUpdateDTO, 
  ClienteRegisterDTO 
} from '../../../interfaces/register-cliente.interface';

@Component({
  selector: 'app-admin-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './admin-cliente.html',
  styleUrls: ['./admin-cliente.css'],
})
export class AdminClientes implements OnInit {

  clientes: ClienteListDTO[] = [];

  showModal = false;
  modalMode: 'create' | 'edit' | 'delete' | null = null;

  clienteCreate: ClienteRegisterDTO = this.getEmptyRegisterDTO();
  clienteEdit: ClienteUpdateDTO = this.getEmptyUpdateDTO();

  clienteAEliminar: ClienteListDTO | null = null;

  mensaje: string = '';
  tipoMensaje: 'success' | 'error' = 'success';

  isLoading = false;

  constructor(
    private clienteService: AdminClientesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerClientes();
  }

  obtenerClientes(): void {
    this.isLoading = true;
    this.clienteService.listarClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ Error al cargar clientes: ${err.message}`, 'error');
        this.isLoading = false;
      }
    });
  }

  abrirModal(mode: 'create' | 'edit' | 'delete', cliente?: ClienteListDTO): void {
    this.modalMode = mode;
    this.showModal = true;

    if (mode === 'create') {
      this.clienteCreate = this.getEmptyRegisterDTO();
    }

    if (mode === 'edit' && cliente) {
      this.clienteEdit = {
        fldNombres: cliente.fldNombres,
        fldApellidos: cliente.fldApellidos,
        fldCorreoElectronico: cliente.fldCorreoElectronico,
        fldContrasena: null
      };
      this.clienteAEliminar = cliente;
    }

    if (mode === 'delete' && cliente) {
      this.clienteAEliminar = cliente;
    }
  }

  cerrarModal(): void {
    this.showModal = false;
    this.modalMode = null;
    this.clienteCreate = this.getEmptyRegisterDTO();
    this.clienteEdit = this.getEmptyUpdateDTO();
    this.clienteAEliminar = null;
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      this.mostrarAlerta('⚠️ Completa todos los campos obligatorios.', 'error');
      return;
    }

    if (this.modalMode === 'create') {
      this.crearCliente(form);
    }

    if (this.modalMode === 'edit') {
      this.editarCliente(form);
    }
  }

  private crearCliente(form: NgForm): void {
    this.clienteService.registrarCliente(this.clienteCreate).subscribe({
      next: () => {
        this.mostrarAlerta('✅ Cliente registrado correctamente.', 'success');
        this.obtenerClientes();
        this.cerrarModalConRetraso(form);
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ No se pudo registrar: ${err.error?.mensaje || err.message}`, 'error');
      }
    });
  }

  private editarCliente(form: NgForm): void {
    if (!this.clienteAEliminar) return;

    this.clienteService.actualizarCliente(
      this.clienteAEliminar.telefono,
      this.clienteEdit
    ).subscribe({
      next: () => {
        this.mostrarAlerta('✅ Cliente actualizado correctamente.', 'success');
        this.obtenerClientes();
        this.cerrarModalConRetraso(form);
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ No se pudo actualizar: ${err.error?.mensaje || err.message}`, 'error');
      }
    });
  }

  confirmarEliminar(): void {
    if (!this.clienteAEliminar) return;

    this.clienteService.eliminarCliente(this.clienteAEliminar.telefono).subscribe({
      next: () => {
        this.mostrarAlerta('🗑 Cliente eliminado correctamente', 'success');
        this.obtenerClientes();
        this.cerrarModal();
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ No se pudo eliminar: ${err.error?.mensaje || err.message}`, 'error');
      }
    });
  }

  // UTILIDADES
  private getEmptyRegisterDTO(): ClienteRegisterDTO {
    return {
      telefono: '',
      fldNombres: '',
      fldApellidos: '',
      fldCorreoElectronico: '',
      fldContrasena: '',
    };
  }

  private getEmptyUpdateDTO(): ClienteUpdateDTO {
    return {
      fldNombres: '',
      fldApellidos: '',
      fldCorreoElectronico: '',
      fldContrasena: null
    };
  }

  private mostrarAlerta(msg: string, type: 'success' | 'error'): void {
    this.mensaje = msg;
    this.tipoMensaje = type;
    setTimeout(() => (this.mensaje = ''), 3000);
  }

  private cerrarModalConRetraso(form: NgForm): void {
    setTimeout(() => {
      this.cerrarModal();
      form.resetForm();
    }, 300);
  }
}
