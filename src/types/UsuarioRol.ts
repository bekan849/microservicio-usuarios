// models/usuario-rol.model.ts
export interface UsuarioRolDB {
  id: string;
  usuario_id: string;
  rol_id: string;
  creado_en: string;
}

export interface UsuarioRolAssignInput {
  usuario_id: string;
  rol_id: string;
}
