import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginService, LoginResponse } from '../../../services/login.service';
import { LoginDTO } from '../../../interfaces/login.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-login-cliente',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrls: ['./login.css'],
})
export class LoginCliente {

    loginForm: FormGroup;
    loading = false;
    errorMessage = '';
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
        this.isError = false;
        this.showDeniedModal = false;

        if (this.loginForm.valid && isPlatformBrowser(this.platformId)) {
            this.loading = true;

            const payload: LoginDTO = {
                correo: this.loginForm.value.email,
                contrasena: this.loginForm.value.password
            };

            this.loginService.iniciarSesion(payload).subscribe({
                next: (res: LoginResponse) => {
                    this.loading = false;
                    
                    if (!res || !res.token) {
                        this.isError = true;
                        this.errorMessage = 'Respuesta incompleta del servidor. Inténtalo de nuevo.';
                        this.showDeniedModal = true;
                        return;
                    }

                    localStorage.setItem('token', res.token);
                    localStorage.setItem('clienteId', res.id ?? '');
                    localStorage.setItem('rol', res.rol ?? ''); 

                    this.authService.updateStatus();

                    this.router.navigate(['/']);
                },

                error: (err: any) => {
                    this.loading = false;
                    this.isError = true;
                    this.showDeniedModal = true;

                    if (err.status === 401) {
                        this.errorMessage = 'Credenciales inválidas. Por favor, revisa tu correo y contraseña.';
                        return;
                    }
                    
                    if (err.status === 404) {
                        this.errorMessage = 'Usuario no encontrado. Asegúrate de que tu correo sea correcto.';
                        return;
                    }
                    
                    this.errorMessage = 'Ingresaste la contraseña o el correo incorrectos';
                }
            });

        } else {
            this.loginForm.markAllAsTouched();
            if(this.loginForm.invalid) {
                this.isError = true;
                this.errorMessage = 'Por favor, asegúrate de completar y revisar el formato de ambos campos.';
                this.showDeniedModal = true; 
            }
        }
    }

    closeDeniedModal() {
        this.showDeniedModal = false;
        this.errorMessage = ''; 
    }
}