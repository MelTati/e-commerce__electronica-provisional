export interface ClienteListDTO {
  telefono: string;
  fldNombres: string;
  fldApellidos: string;
  fldCorreoElectronico: string;
}

export interface ClienteUpdateDTO {
  fldNombres: string;
  fldApellidos: string;
  fldCorreoElectronico: string;
  fldContrasena: string | null; 
}

export interface ClienteRegisterDTO {
  telefono: string;
  fldNombres: string;
  fldApellidos: string;
  fldCorreoElectronico: string;
  fldContrasena: string;
}
