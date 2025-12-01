// src/app/interfaces/ventas.interface.ts
export interface Venta {
  idventas: number;
  fecha: string;     
  estado: string;    // ejemplo: "pagado", "pendiente", "cancelado"
  cliente: string;
  total: number;
}

