// models/permiso.model.ts

/* ======================================================
   MÓDULOS DEL SISTEMA
====================================================== */
export type Modulo =
  | "USUARIOS"
  | "USUARIO_ROL"
  | "ROLES"
  | "PERMISOS"
  | "PRODUCTOS"
  | "VEHICULOS"
  | "CATEGORIAS"
  | "SUBCATEGORIAS"
  | "MARCAS"
  | "PROVEEDORES"
  | "COMPRAS"
  | "VENTAS"
  | "DETALLE_COMPRA"
  | "DETALLE_VENTA"
  | "CONFIG_GLOBAL";

/* ======================================================
   PERMISO EN BASE DE DATOS
====================================================== */
export interface PermisoDB {
  id: string;
  rol_id: string;
  modulo: Modulo;
  puede_get: boolean;
  puede_post: boolean;
  puede_put: boolean;
  puede_delete: boolean;
}

/* ======================================================
   INPUT PARA CREAR / ACTUALIZAR (UPSERT)
====================================================== */
export interface PermisoUpsertInput {
  rol_id: string;
  modulo: Modulo;
  puede_get: boolean;
  puede_post: boolean;
  puede_put: boolean;
  puede_delete: boolean;
}
