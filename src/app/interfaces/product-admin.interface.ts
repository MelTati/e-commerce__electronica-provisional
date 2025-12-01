export interface ProductoDTO {
  codigo_producto: number;
  fldNombre: string;
  fldPrecio: string;
  fldMarca: string;
  descripcion: string;
  unidades: number;
}

export interface ProductoCreateDTO {
  fldNombre: string;
  fldPrecio: string;
  fldMarca: string;
  descripcion: string;
  unidades: number;
}

export interface ProductoUpdateDTO {
  fldNombre?: string;
  fldPrecio?: string;
  fldMarca?: string;
  descripcion?: string;
  unidades?: number;
}
