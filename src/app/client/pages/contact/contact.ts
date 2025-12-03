import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CosultaDTO } from '../../../interfaces/contact.interface';
import { ConsultaService } from '../../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
})
export class Contact {

  // DTO
  formulario: CosultaDTO = {
    telefono: '',
    id_tipo: 0,
    fldAsunto: '',
    fldMensaje: ''
  };

  // Tipos de consulta
  tiposConsulta = [
    { id_tipo: 1, fldOpciones: 'Producto defectuoso' },
    { id_tipo: 2, fldOpciones: 'Método de pago' },
    { id_tipo: 3, fldOpciones: 'Envío' },
    { id_tipo: 4, fldOpciones: 'Garantía' },
    { id_tipo: 5, fldOpciones: 'Devolución' }
  ];

  // Propiedad para controlar el error de teléfono
  telefonoInvalido: boolean = false;

  constructor(private consultaService: ConsultaService) {}

  enviarFormulario(form: NgForm) {
    if (!form.valid) return;

    // Convertir id_tipo a número antes de enviar
    const consultaEnvio: CosultaDTO = {
      ...this.formulario,
      id_tipo: Number(this.formulario.id_tipo)
    };

    // Enviar la consulta al backend
    this.consultaService.registroConsulta(consultaEnvio).subscribe({
      next: (resp) => {
        alert('✔️ Consulta enviada correctamente.');
        form.resetForm();
        this.formulario = { telefono: '', id_tipo: 0, fldAsunto: '', fldMensaje: '' };
        this.telefonoInvalido = false;
      },
      error: (err) => {
        // Si el backend indica que el teléfono no existe
        if (err.status === 400 && err.error?.message === 'TELÉFONO_INVALIDO') {
          this.telefonoInvalido = true;
        } else {
          alert('❌ Ocurrió un error al enviar tu mensaje.');
        }
      }
    });
  }
}
