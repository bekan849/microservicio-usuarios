export interface Permiso {
  id: string;
  rol_id: string;
  modulo: string;
  puede_get: boolean;
  puede_post: boolean;
  puede_put: boolean;
  puede_delete: boolean;
}
