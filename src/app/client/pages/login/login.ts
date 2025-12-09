import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService, LoginResponse } from '../../../services/login.service';
import { LoginDTO } from '../../../interfaces/login.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-login-cliente',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrls: ['./login.css'],
})

export class LoginCliente {

    loginForm: FormGroup;
    loading = false;
    errorMessage = '';
    successMessage = '';
    isError = false;
    showDeniedModal = false;

    constructor(
        private fb: FormBuilder,
        private loginService: LoginService,
        private authService: AuthService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(1)]], 
        });
    }

    get email() { return this.loginForm.get('email'); }
    get password() { return this.loginForm.get('password'); }

    onSubmit() {
        this.errorMessage = '';
        this.successMessage = '';
        this.isError = false;

        if (this.loginForm.valid && isPlatformBrowser(this.platformId)) {
            this.loading = true;

            const payload: LoginDTO = {
                correo: this.loginForm.value.email,
                contrasena: this.loginForm.value.password
            };

            this.loginService.iniciarSesion(payload).subscribe({
                next: (res: LoginResponse) => {
                    this.loading = false;

                    if (!res || !res.token || !res.id || !res.rol) {
                        this.isError = true;
                        this.errorMessage = 'Hubo un problema al recibir tu información. Por favor, inténtalo de nuevo.';
                        this.showDeniedModal = true;
                        return;
                    }

                    localStorage.setItem('token', res.token);
                    localStorage.setItem('clienteId', res.id);
                    localStorage.setItem('rol', res.rol);

                    this.authService.updateStatus();
                    
                    this.router.navigate(['/']); 
                },

                error: (err: any) => {
                    this.loading = false;
                    this.isError = true;

                    if (err.status === 401 || err.status === 403) {
                        this.errorMessage = 'El correo o la contraseña que ingresaste son incorrectos. Por favor, verifícalos.';
                        this.showDeniedModal = true;
                        return;
                    }
                    this.errorMessage = 'Algo salió mal. Por favor, inténtalo de nuevo más tarde.';
                }
            });

        } else {
            this.loginForm.markAllAsTouched();
            if(this.loginForm.invalid) {
                this.isError = true;
                this.errorMessage = 'Por favor, asegúrate de completar y revisar el formato de ambos campos.';
            }
        }
    }

    closeDeniedModal() {
        this.showDeniedModal = false;
    }
}