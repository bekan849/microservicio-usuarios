// models/user.model.ts
export interface UserDB {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string | null;
  estado: boolean;
  creado_en: string;       // ISO (timestamptz)
  auth_user_id: string | null;
}

export interface UserCreateInput {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  password: string; // ✅ obligatorio si creas Auth
}

export interface UserUpdateInput {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  estado?: boolean;
}

export interface UserWithRole extends UserDB {
  rol_id: string | null;
  rol_nombre: string | null;
}
