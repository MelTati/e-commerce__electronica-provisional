import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CosultaDTO } from '../../../interfaces/contact.interface';
import { ConsultaService } from '../../../services/contact.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})

export class Contact implements OnInit, AfterViewInit, OnDestroy {

  formulario: CosultaDTO = {
    telefono: '',
    id_tipo: 0,
    fldAsunto: '',
    fldMensaje: ''
  };

  tiposConsulta = [
    { id_tipo: 1, fldOpciones: 'Producto defectuoso' },
    { id_tipo: 2, fldOpciones: 'Método de pago' },
    { id_tipo: 3, fldOpciones: 'Envío' },
    { id_tipo: 4, fldOpciones: 'Garantía' },
    { id_tipo: 5, fldOpciones: 'Devolución' }
  ];

  telefonoInvalido: boolean = false;

  mensajeNotificacion = { texto: '', tipo: null as 'success' | 'error' | null };

  private listeners: (() => void)[] = [];
  private lastScroll = { x: 0, y: 0 };

  constructor(
    private consultaService: ConsultaService,
    private authService: AuthService,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const clienteData = this.authService.getClientData();

    if (!clienteData) {
      this.router.navigate(['/login']);
      return;
    }

    this.formulario.telefono = clienteData.id;
  }

  ngAfterViewInit(): void {
    const componentEl: HTMLElement = this.el.nativeElement;
    const fields: NodeListOf<HTMLElement> = componentEl.querySelectorAll('input, textarea, select');

    fields.forEach((field) => {

      const mousedown = this.renderer.listen(field, 'mousedown', (e: Event) => {
        this.lastScroll.x = window.scrollX;
        this.lastScroll.y = window.scrollY;
        e.preventDefault();
        (field as any).focus({ preventScroll: true });
      });

      const touch = this.renderer.listen(field, 'touchstart', () => {
        this.lastScroll.x = window.scrollX;
        this.lastScroll.y = window.scrollY;
        (field as any).focus({ preventScroll: true });
      });

      const focus = this.renderer.listen(field, 'focus', () => {
        setTimeout(() => window.scrollTo(this.lastScroll.x, this.lastScroll.y), 0);
      });

      this.listeners.push(mousedown, touch, focus);
    });
  }

  ngOnDestroy(): void {
    this.listeners.forEach(fn => fn());
  }

  mostrarNotificacion(texto: string, tipo: 'success' | 'error'): void {
    this.mensajeNotificacion = { texto, tipo };

    setTimeout(() => {
      this.mensajeNotificacion = { texto: '', tipo: null };
    }, 4000);
  }

  enviarFormulario(form: NgForm) {
    if (!form.valid) return;

    const consultaEnvio: CosultaDTO = {
      ...this.formulario,
      id_tipo: Number(this.formulario.id_tipo)
    };

    this.consultaService.registroConsulta(consultaEnvio).subscribe({
      next: () => {
        this.mostrarNotificacion('✔️ Consulta enviada correctamente.', 'success');
        form.resetForm();

        const telefono = this.authService.getClientData()?.id || '';
        this.formulario = { telefono, id_tipo: 0, fldAsunto: '', fldMensaje: '' };
        this.telefonoInvalido = false;
      },
      error: (err) => {
        if (err.status === 400 && err.error?.message === 'TELÉFONO_INVALIDO') {
          this.telefonoInvalido = true;
          this.mostrarNotificacion('El teléfono es inválido, verifica tus datos.', 'error');
        } else {
          this.mostrarNotificacion('❌ Error al enviar el mensaje.', 'error');
        }
      }
    });
  }
}
