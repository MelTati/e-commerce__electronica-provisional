import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegisterService } from '../../services/register.service';
import { RegisterDTO } from '../../interfaces/register.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  readonly registerForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private registerService: RegisterService) {
    this.registerForm = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]] // <-- contraseña añadida
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    if (this.loading) return;
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;

    const payload: RegisterDTO = {
      telefono: this.f['telefono'].value || '',
      fldNombres: this.f['nombres'].value || '',
      fldApellidos: this.f['apellidos'].value || '',
      fldCorreoElectronico: this.f['email'].value || '',
      fldContrasena: this.f['contrasena'].value || '' // <-- contraseña añadida
    };

    this.registerService.registroCliente(payload).subscribe({
      next: () => {
        alert('Usuario registrado correctamente');
        this.registerForm.reset();
        this.loading = false;
      },
      error: (err) => {
        alert('Error al registrar usuario: ' + (err?.error?.message || err.message || 'Error desconocido'));
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.values(this.registerForm.controls).forEach(control => control.markAsTouched());
  }
}
