import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminLoginService, AdminLoginResponse } from '../../../services/login-admin.service';
import { LoginDTO } from '../../../interfaces/login.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-admin.html',
  styleUrls: ['./login-admin.css'],
})
export class LoginAdmin {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  isError = false;
  showDeniedModal = false;

  constructor(
    private fb: FormBuilder,
    private adminLoginService: AdminLoginService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isError = false;
    this.showDeniedModal = false;

    if (this.loginForm.valid && isPlatformBrowser(this.platformId)) {
      this.loading = true;

      const payload: LoginDTO = {
        correo: this.loginForm.value.email,
        contrasena: this.loginForm.value.password,
      };

      this.adminLoginService.iniciarSesion(payload).subscribe({
        next: (res: AdminLoginResponse) => {
          this.loading = false;

          if (!res || !res.token || !res.id || !res.rol) {
            this.isError = true;
            this.errorMessage = 'Credenciales inválidas o respuesta incompleta del servidor.';
            this.showDeniedModal = true;
            return;
          }

          localStorage.setItem('token', res.token);
          localStorage.setItem('adminId', res.id);
          localStorage.setItem('rol', res.rol);
          this.authService.updateStatus();

          this.router.navigate(['/admin/admin-usuario']);
        },
        error: (err: any) => {
          this.loading = false;
          this.isError = true;

          if (err.status === 401 || err.status === 403) {
            this.errorMessage = 'Correo o contraseña incorrectos. Por favor, verifica tus credenciales.';
            this.showDeniedModal = true;
            return;
          }

          this.errorMessage = err?.error?.message || 'Ocurrió un error inesperado. Inténtalo más tarde.';
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
      if(this.loginForm.invalid) {
        this.isError = true;
        this.errorMessage = 'Por favor, completa correctamente los campos requeridos.';
      }
    }
  }

  closeDeniedModal() {
    this.showDeniedModal = false;
  }
}