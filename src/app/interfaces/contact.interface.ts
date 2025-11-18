export interface CosultaDTO {
  telefono: string, //Pertenece a la tabla de clientes
  id_tipo: number, //Pertenece a la tabla de tipo_consulta
  fldAsunto: string,
  fldMensaje: string
}