import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AdminService, AdminPerfil } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil-admin.html',
  styleUrls: ['./perfil-admin.css']
})
export class PerfilAdmin implements OnInit {

  form!: FormGroup;
  adminId!: string;
  loading = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const data = this.authService.getAdminData();

    if (!data) {
      this.router.navigate(['/login-admin']);
      return;
    }

    this.adminId = data.id;

    this.form = this.fb.group({
      fldTelefono: ['', Validators.required],
      fldNombre: ['', Validators.required],
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

    this.adminService.updateAdmin(+this.adminId, this.form.value as AdminPerfil).subscribe({
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
