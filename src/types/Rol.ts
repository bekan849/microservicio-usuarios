export type RolNombre = "ADMIN" | "INVENTARIO" | "VENTAS" | "VENDEDOR";

export interface RolDB {
  id: string;
  nombre: RolNombre;
  descripcion: string | null;
  estado: boolean;
  creado_en: string;
}

export interface RolCreateInput {
  nombre: RolNombre;
  descripcion?: string;
}

export interface RolUpdateInput {
  nombre?: RolNombre;
  descripcion?: string;
  estado?: boolean;
}
