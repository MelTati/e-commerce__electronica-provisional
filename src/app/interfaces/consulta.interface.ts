// src/app/interfaces/consulta.interface.ts
export interface Consulta {
  id_consulta: number;
  cliente_nombre: string;
  cliente_apellido: string;
  cliente_email: string;
  telefono: string;
  tipo_consulta: string;
  asunto: string;
  mensaje: string;
}