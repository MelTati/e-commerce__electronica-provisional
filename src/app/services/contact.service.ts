// src/app/services/register.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CosultaDTO } from '../interfaces/contact.interface';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {

  private readonly registroUrl = '/api/consultas';

  constructor(private http: HttpClient) {}

  /**
   * Registra un nuevo cliente en el backend.
   * @param payload Datos del usuario a registrar.
   * @returns Observable con la respuesta del backend.
   */
  registroConsulta(payload: CosultaDTO): Observable<any> {
    console.log('📤 Enviando registro de cliente:', payload);

    return this.http.post(this.registroUrl, payload).pipe(
      catchError((error: HttpErrorResponse) => {
        const mensaje =
          error.error?.mensaje ??
          error.message ??
          'Error desconocido al registrar cliente';

        console.error('❌ Error en registroCliente():', mensaje);
        return throwError(() => new Error(mensaje));
      })
    );
  }
}
