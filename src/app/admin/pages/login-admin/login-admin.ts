import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminLoginService, AdminLoginResponse } from '../../../services/login-admin.service';
import { LoginDTO } from '../../../interfaces/login.interface';

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

  constructor(
    private fb: FormBuilder,
    private adminLoginService: AdminLoginService,
    @Inject(PLATFORM_ID) private platformId: Object
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

    if (this.loginForm.valid && isPlatformBrowser(this.platformId)) {
      this.loading = true;

      const payload: LoginDTO = {
        correo: this.loginForm.value.email,
        contrasena: this.loginForm.value.password
      };

      this.adminLoginService.iniciarSesion(payload).subscribe({
        next: (res: AdminLoginResponse) => {
          this.loading = false;

          localStorage.setItem('token', res.token);
          localStorage.setItem('adminId', res.id);
          localStorage.setItem('rol', res.rol);

          console.log('LOGIN ADMIN EXITOSO:', res);
        },
        error: (err: Error) => {
          this.loading = false;
          this.errorMessage = err.message;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
