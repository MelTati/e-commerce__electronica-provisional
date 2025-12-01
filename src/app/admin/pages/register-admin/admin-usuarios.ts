import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { AdminUsuariosService } from '../../../services/register-admin.service';
import { RegisterDTO, AdminUpdateDTO, AdminListDTO } from '../../../interfaces/register-admin.interface';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.css'],
})
export class AdminUsuarios implements OnInit {

  admins: AdminListDTO[] = [];

  showModal = false;
  modalMode: 'create' | 'edit' | 'delete' | null = null;

  adminData: RegisterDTO | AdminUpdateDTO = this.getEmptyRegisterDTO();

  adminAEliminar: AdminListDTO | null = null;

  mensaje: string = '';
  tipoMensaje: 'success' | 'error' = 'success';

  isLoading = false;

  constructor(
    private adminService: AdminUsuariosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerAdmins();
  }

  obtenerAdmins(): void {
    this.isLoading = true;

    this.adminService.listarAdmins().subscribe({
      next: (admins) => {
        this.admins = admins;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ Error al cargar admins: ${err.message}`, 'error');
        this.isLoading = false;
      }
    });
  }

  abrirModal(mode: 'create' | 'edit' | 'delete', admin?: AdminListDTO): void {
    this.modalMode = mode;
    this.showModal = true;

    if (mode === 'create') {
      this.adminData = this.getEmptyRegisterDTO();
    }

    if (mode === 'edit' && admin) {
      this.adminData = {
        fldNombre: admin.fldNombre,
        fldCorreoElectronico: admin.fldCorreoElectronico,
        fldTelefono: admin.fldTelefono,
        fldContrasena: null
      };
      this.adminAEliminar = admin;
    }

    if (mode === 'delete' && admin) {
      this.adminAEliminar = admin;
    }
  }

  cerrarModal(): void {
    this.showModal = false;
    this.modalMode = null;
    this.adminData = this.getEmptyRegisterDTO(); 
    this.adminAEliminar = null;
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      this.mostrarAlerta('⚠️ Completa todos los campos obligatorios.', 'error');
      return;
    }

    if (this.modalMode === 'create') {
      this.crearAdmin(form);
    }

    if (this.modalMode === 'edit') {
      this.editarAdmin(form);
    }
  }

  private crearAdmin(form: NgForm): void {
    this.adminService.registrarAdmin(this.adminData as RegisterDTO).subscribe({
      next: () => {
        this.mostrarAlerta('✅ Administrador creado correctamente.', 'success');
        this.obtenerAdmins();
        this.cerrarModalConRetraso(form);
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ No se pudo crear: ${err.error?.mensaje || err.message}`, 'error');
      }
    });
  }

  private editarAdmin(form: NgForm): void {
    if (!this.adminAEliminar) return;

    this.adminService.actualizarAdmin(this.adminAEliminar.id_usuario, this.adminData as AdminUpdateDTO).subscribe({
      next: () => {
        this.mostrarAlerta('✅ Administrador actualizado correctamente.', 'success');
        this.obtenerAdmins();
        this.cerrarModalConRetraso(form);
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ No se pudo actualizar: ${err.error?.mensaje || err.message}`, 'error');
      }
    });
  }

  confirmarEliminar(): void {
    if (!this.adminAEliminar) return;

    this.adminService.eliminarAdmin(this.adminAEliminar.id_usuario).subscribe({
      next: () => {
        this.mostrarAlerta('🗑 Eliminado correctamente', 'success');
        this.obtenerAdmins();
        this.cerrarModal();
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ No se pudo eliminar: ${err.error?.mensaje || err.message}`, 'error');
      }
    });
  }

  // UTILIDADES
  private getEmptyRegisterDTO(): RegisterDTO {
    return {
      fldNombre: '',
      fldCorreoElectronico: '',
      fldTelefono: '',
      fldContrasena: '',
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
