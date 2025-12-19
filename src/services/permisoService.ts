// src/services/permiso.service.ts
import { supabaseAdmin } from "../config/supabaseClient";
import type { Modulo, PermisoDB, PermisoUpsertInput } from "../types/Permiso";

const TABLE = "permisos";

/* ======================================================
   Helpers
====================================================== */
function mapRowToPermiso(row: any): PermisoDB {
  return {
    id: row.id,
    rol_id: row.rol_id,
    modulo: row.modulo,
    puede_get: !!row.puede_get,
    puede_post: !!row.puede_post,
    puede_put: !!row.puede_put,
    puede_delete: !!row.puede_delete,
  };
}

function normalizeUpsert(input: PermisoUpsertInput): PermisoUpsertInput {
  return {
    rol_id: input.rol_id.trim(),
    modulo: input.modulo, // ya viene tipado
    puede_get: !!input.puede_get,
    puede_post: !!input.puede_post,
    puede_put: !!input.puede_put,
    puede_delete: !!input.puede_delete,
  };
}

/* ======================================================
   Service
====================================================== */
export const permisoService = {
  /**
   * Upsert de permiso por rol + módulo.
   *
   * REQUISITO DB:
   *   unique (rol_id, modulo)
   *
   * Si ya existe, actualiza. Si no existe, crea.
   */
  async upsert(input: PermisoUpsertInput): Promise<PermisoDB> {
    const payload = normalizeUpsert(input);

    // En Supabase, upsert requiere especificar onConflict
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .upsert([payload], { onConflict: "rol_id,modulo" })
      .select("*")
      .single();

    if (error) throw error;
    return mapRowToPermiso(data);
  },

  /**
   * Upsert masivo: ideal para definir permisos de un rol de una vez.
   */
  async upsertMany(inputs: PermisoUpsertInput[]): Promise<PermisoDB[]> {
    if (!Array.isArray(inputs) || inputs.length === 0) return [];

    const payload = inputs.map(normalizeUpsert);

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .upsert(payload, { onConflict: "rol_id,modulo" })
      .select("*");

    if (error) throw error;
    return (data ?? []).map(mapRowToPermiso);
  },

  /**
   * Obtiene todos los permisos de un rol.
   */
  async getByRol(rol_id: string): Promise<PermisoDB[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("rol_id", rol_id)
      .order("modulo", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapRowToPermiso);
  },

  /**
   * Obtiene permiso exacto por rol y módulo (clave para authorize()).
   */
  async getByRolAndModulo(rol_id: string, modulo: Modulo): Promise<PermisoDB | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("rol_id", rol_id)
      .eq("modulo", modulo)
      .maybeSingle();

    if (error) throw error;
    return data ? mapRowToPermiso(data) : null;
  },

  /**
   * Elimina permiso específico.
   */
  async remove(rol_id: string, modulo: Modulo): Promise<{ ok: true }> {
    const { error } = await supabaseAdmin.from(TABLE).delete().eq("rol_id", rol_id).eq("modulo", modulo);
    if (error) throw error;
    return { ok: true };
  },

  /**
   * Atajo para "setear" todo el set de permisos de un rol
   * recibiendo un mapa por módulo.
   *
   * Ejemplo:
   * setManyForRol("rolId", {
   *   PRODUCTOS: { puede_get:true, puede_post:true, puede_put:true, puede_delete:false },
   *   VENTAS: { puede_get:true, puede_post:false, puede_put:false, puede_delete:false }
   * })
   */
  async setManyForRol(
    rol_id: string,
    permissionsByModule: Partial<
      Record<
        Modulo,
        { puede_get: boolean; puede_post: boolean; puede_put: boolean; puede_delete: boolean }
      >
    >
  ): Promise<PermisoDB[]> {
    const items: PermisoUpsertInput[] = Object.entries(permissionsByModule).map(([modulo, perms]) => ({
      rol_id,
      modulo: modulo as Modulo,
      puede_get: !!perms?.puede_get,
      puede_post: !!perms?.puede_post,
      puede_put: !!perms?.puede_put,
      puede_delete: !!perms?.puede_delete,
    }));

    return this.upsertMany(items);
  },
};
