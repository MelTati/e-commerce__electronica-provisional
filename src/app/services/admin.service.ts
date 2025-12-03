import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminPerfil {
  fldTelefono: string;
  fldNombre: string;
  fldCorreoElectronico: string;
  fldContrasena?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  updateAdmin(id: number, data: AdminPerfil): Observable<void> {
    const body: any = { ...data };
    if (!body.fldContrasena) delete body.fldContrasena;
    return this.http.put<void>(`${this.apiUrl}/admin/usuarios/${id}`, body);
  }
}
