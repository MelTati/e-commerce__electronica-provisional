import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]] 
    });
  }

  get f() {
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
      this.errorMessage = 'Por favor, corrige los errores en los campos.';
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
        this.successMessage = '¡Registro exitoso! Ya puedes iniciar sesión.';
        this.registerForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.isError = true;
        this.errorMessage = 'Error al registrar: ' + (err?.error?.message || 'Error de conexión o datos duplicados.');
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.values(this.registerForm.controls).forEach(control => control.markAsTouched());
  }
}