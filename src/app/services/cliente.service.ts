import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClientePerfil {
  fldNombres: string;
  fldApellidos: string;
  fldCorreoElectronico: string;
  fldContrasena?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  updateCliente(telefono: string, data: ClientePerfil): Observable<void> {
    const body: any = { ...data };
    if (!body.fldContrasena) delete body.fldContrasena;
    return this.http.put<void>(`${this.apiUrl}/clientes/${telefono}`, body);
  }
}
