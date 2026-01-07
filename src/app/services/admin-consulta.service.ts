// src/app/services/consultas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consulta } from '../interfaces/consulta.interface';

@Injectable({
  providedIn: 'root'
})

export class ConsultasService {

  private baseUrl = '/api'; 

  constructor(private http: HttpClient) {}

  getConsultas(): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${this.baseUrl}/admin/consultas`);
  }

  eliminarConsulta(idConsulta: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/consultas/${idConsulta}`);
  }
}