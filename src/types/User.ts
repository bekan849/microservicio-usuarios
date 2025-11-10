export interface User {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  estado?: boolean;
  creado_en?: string;
  auth_user_id?: string;
  created_by?: string;
}
