import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { AdminProductosService } from '../../../services/admin-product.service';
import { 
  ProductoDTO, 
  ProductoCreateDTO, 
  ProductoUpdateDTO 
} from '../../../interfaces/product-admin.interface';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './admin-product.html',
  styleUrls: ['./admin-product.css'],
})
export class AdminProductos implements OnInit {

  productos: ProductoDTO[] = [];

  showModal = false;
  modalMode: 'create' | 'edit' | 'delete' | null = null;

  productoCreate: ProductoCreateDTO = this.getEmptyCreateDTO();
  productoEdit: ProductoUpdateDTO = this.getEmptyUpdateDTO();

  productoAEliminar: ProductoDTO | null = null;

  mensaje: string = '';
  tipoMensaje: 'success' | 'error' = 'success';

  isLoading = false;

  constructor(
    private productoService: AdminProductosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.isLoading = true;
    this.productoService.listarProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ Error al cargar productos: ${err.message}`, 'error');
        this.isLoading = false;
      }
    });
  }

  abrirModal(mode: 'create' | 'edit' | 'delete', producto?: ProductoDTO): void {
    this.modalMode = mode;
    this.showModal = true;

    if (mode === 'create') {
      this.productoCreate = this.getEmptyCreateDTO();
    }

    if (mode === 'edit' && producto) {
      this.productoEdit = {
        fldNombre: producto.fldNombre,
        fldPrecio: producto.fldPrecio,
        fldMarca: producto.fldMarca,
        descripcion: producto.descripcion,
        unidades: producto.unidades
      };
      this.productoAEliminar = producto;
    }

    if (mode === 'delete' && producto) {
      this.productoAEliminar = producto;
    }
  }

  cerrarModal(): void {
    this.showModal = false;
    this.modalMode = null;
    this.productoCreate = this.getEmptyCreateDTO();
    this.productoEdit = this.getEmptyUpdateDTO();
    this.productoAEliminar = null;
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      this.mostrarAlerta('⚠️ Completa todos los campos obligatorios.', 'error');
      return;
    }

    if (this.modalMode === 'create') {
      this.crearProducto(form);
    }

    if (this.modalMode === 'edit') {
      this.editarProducto(form);
    }
  }

  private crearProducto(form: NgForm): void {
    this.productoService.crearProducto(this.productoCreate).subscribe({
      next: () => {
        this.mostrarAlerta('✅ Producto registrado correctamente.', 'success');
        this.obtenerProductos();
        this.cerrarModalConRetraso(form);
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ No se pudo registrar: ${err.error?.mensaje || err.message}`, 'error');
      }
    });
  }

  private editarProducto(form: NgForm): void {
    if (!this.productoAEliminar) return;

    this.productoService.actualizarProducto(
      this.productoAEliminar.codigo_producto,
      this.productoEdit
    ).subscribe({
      next: () => {
        this.mostrarAlerta('✅ Producto actualizado correctamente.', 'success');
        this.obtenerProductos();
        this.cerrarModalConRetraso(form);
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ No se pudo actualizar: ${err.error?.mensaje || err.message}`, 'error');
      }
    });
  }

  confirmarEliminar(): void {
    if (!this.productoAEliminar) return;

    this.productoService.eliminarProducto(this.productoAEliminar.codigo_producto).subscribe({
      next: () => {
        this.mostrarAlerta('🗑 Producto eliminado correctamente', 'success');
        this.obtenerProductos();
        this.cerrarModal();
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarAlerta(`❌ No se pudo eliminar: ${err.error?.mensaje || err.message}`, 'error');
      }
    });
  }

  // UTILIDADES
  private getEmptyCreateDTO(): ProductoCreateDTO {
    return {
      fldNombre: '',
      fldPrecio: '',
      fldMarca: '',
      descripcion: '',
      unidades: 0
    };
  }

  private getEmptyUpdateDTO(): ProductoUpdateDTO {
    return {
      fldNombre: '',
      fldPrecio: '',
      fldMarca: '',
      descripcion: '',
      unidades: 0
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
