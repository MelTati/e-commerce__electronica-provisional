export interface RegisterDTO {
  fldTelefono: string;
  fldNombre: string;
  fldCorreoElectronico: string;
  fldContrasena: string;
}

export interface AdminUpdateDTO {
  fldTelefono?: string;
  fldNombre?: string;
  fldCorreoElectronico?: string;
  fldContrasena?: string | null;
}

export interface AdminListDTO {
  id_usuario: number;
  fldNombre: string;
  fldCorreoElectronico: string;
  fldTelefono: string;
}
