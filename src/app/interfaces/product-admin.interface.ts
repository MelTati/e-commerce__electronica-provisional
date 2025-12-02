export interface CategoriaDTO {
  id_categorias: number;
  fldNombre: string;
  fldDescripcion: string;
}

export interface ProductoDTO {
  codigo_producto: number;
  fldNombre: string;
  fldPrecio: string;
  fldMarca: string;
  descripcion: string;
  unidades: number;
  categorias_nombres: string;
  categorias_ids: string;
}

export interface ProductoCreateDTO {
  fldNombre: string;
  fldPrecio: number;
  fldMarca: string;
  descripcion: string;
  unidades: number;
  categorias: number[];
}

export interface ProductoUpdateDTO {
  fldNombre?: string;
  fldPrecio?: number;
  fldMarca?: string;
  descripcion?: string;
  unidades?: number;
  categorias?: number[];
}
