import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegisterService } from '../../../services/register.service';
import { RegisterDTO } from '../../../interfaces/register.interface';
import { RouterLink} from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})

export class RegisterComponent {
  readonly registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  isError = false;

  constructor(private fb: FormBuilder, private registerService: RegisterService) {
    this.registerForm = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]] 
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    if (this.loading) return;
    
    this.errorMessage = '';
    this.successMessage = '';
    this.isError = false;

    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      this.isError = true;
      this.errorMessage = 'Por favor, corrige los errores en los campos marcados.';
      return;
    }

    this.loading = true;

    const payload: RegisterDTO = {
      telefono: this.f['telefono'].value || '',
      fldNombres: this.f['nombres'].value || '',
      fldApellidos: this.f['apellidos'].value || '',
      fldCorreoElectronico: this.f['email'].value || '',
      fldContrasena: this.f['contrasena'].value || '' 
    };

    this.registerService.registroCliente(payload).subscribe({
      next: () => {
        this.successMessage = '¡Registro completado con éxito! Ahora puedes iniciar sesión con tu correo y contraseña.';
        this.registerForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.isError = true;
        this.loading = false;
        
        const backendMessage = err?.error?.message || err?.error?.error || '';
        const httpStatus = err.status;
        
        let friendlyMessage = 'Algo salió mal. Por favor, intenta de nuevo más tarde.';

        if (httpStatus === 409 || backendMessage.toLowerCase().includes('duplicado') || backendMessage.toLowerCase().includes('already exists')) {
             friendlyMessage = '¡Ya existe una cuenta con este correo electrónico o teléfono! Por favor, verifica tus datos o ve a la página de inicio de sesión.';
        } else if (httpStatus === 0) {
            friendlyMessage = 'No se pudo conectar al servidor. Revisa tu conexión a internet e inténtalo de nuevo.';
        } else if (httpStatus === 400 || httpStatus === 500) {
             friendlyMessage = ' Error de registro: ' + (backendMessage || 'Ocurrió un error inesperado en el servidor.');
        } else {
             friendlyMessage = 'Error al registrar: ' + (backendMessage || 'Servidor no respondió.');
        }

        this.errorMessage = friendlyMessage;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.values(this.registerForm.controls).forEach(control => control.markAsTouched());
  }
}