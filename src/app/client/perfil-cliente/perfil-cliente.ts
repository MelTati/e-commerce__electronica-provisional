import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil-cliente.html',
  styleUrls: ['./perfil-cliente.css']
})
export class PerfilCliente implements OnInit {

  form!: FormGroup;
  telefono!: string;
  loading = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const data = this.authService.getClientData();

    if (!data) {
      this.router.navigate(['/login']);
      return;
    }

    // 🔐 ID del cliente logueado
    this.telefono = data.id;

    // 📌 No se cargan datos, solo campos vacíos
    this.form = this.fb.group({
      fldNombres: ['', Validators.required],
      fldApellidos: ['', Validators.required],
      fldCorreoElectronico: ['', [Validators.required, Validators.email]],
      fldContrasena: ['']
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.clienteService.updateCliente(this.telefono, this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Perfil actualizado correctamente';
      },
      error: () => {
        this.loading = false;
        this.message = 'Error al actualizar';
      }
    });
  }
}
