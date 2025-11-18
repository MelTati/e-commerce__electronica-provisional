import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { loginService  } from '../../services/login.service';
import { LoginDTO } from '../../interfaces/login.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})

export class Login {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private loginService : loginService 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
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

    if (this.loginForm.valid) {
      this.loading = true;

      const payload: LoginDTO = {
        fldCorreoElectronico: this.loginForm.value.email,
        fldContrasena: this.loginForm.value.password
      };

      console.log('📤 Enviando login de cliente:', payload);

      this.loginService.iniciarSesion(payload).subscribe({
        next: (res) => {
          this.loading = false;
          console.log('✅ Login exitoso:', res);
        },
        error: (err: Error) => {
          this.loading = false;
          this.errorMessage = err.message;
          console.error('❌ Error en login:', err.message);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      console.warn('Formulario inválido. Revisar los campos.');
    }
  }
}
