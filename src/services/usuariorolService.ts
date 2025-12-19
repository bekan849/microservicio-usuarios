// src/services/usuarioRol.service.ts
import { supabaseAdmin } from "../config/supabaseClient";
import type { UsuarioRolDB, UsuarioRolAssignInput } from "../types/UsuarioRol";

const TABLE = "usuario_rol";
const USERS_TABLE = "usuarios";
const ROLES_TABLE = "roles";

/* ======================================================
   Helpers
====================================================== */
function mapRowToUsuarioRol(row: any): UsuarioRolDB {
  return {
    id: row.id,
    usuario_id: row.usuario_id,
    rol_id: row.rol_id,
    creado_en: row.creado_en,
  };
}

/* ======================================================
   Service
====================================================== */
export const usuarioRolService = {
  /**
   * Asigna (o reemplaza) el rol de un usuario.
   *
   * REQUISITO DB:
   *  - unique(usuario_id) en usuario_rol
   *
   * Flujo:
   *  1) valida que exista el usuario y esté activo
   *  2) valida que exista el rol y esté activo
   *  3) upsert en usuario_rol por usuario_id (1 rol por usuario)
   */
  async assignRole(input: UsuarioRolAssignInput): Promise<UsuarioRolDB> {
    const usuario_id = input.usuario_id.trim();
    const rol_id = input.rol_id.trim();

    if (!usuario_id) {
      const e: any = new Error("usuario_id es requerido");
      e.statusCode = 400;
      throw e;
    }
    if (!rol_id) {
      const e: any = new Error("rol_id es requerido");
      e.statusCode = 400;
      throw e;
    }

    // 1) Validar usuario existe y está activo
    const { data: user, error: errUser } = await supabaseAdmin
      .from(USERS_TABLE)
      .select("id, estado")
      .eq("id", usuario_id)
      .maybeSingle();

    if (errUser) throw errUser;
    if (!user) {
      const e: any = new Error("Usuario no encontrado.");
      e.statusCode = 404;
      throw e;
    }
    if (user.estado === false) {
      const e: any = new Error("No se puede asignar rol a un usuario inactivo.");
      e.statusCode = 409;
      throw e;
    }

    // 2) Validar rol existe y está activo
    const { data: rol, error: errRol } = await supabaseAdmin
      .from(ROLES_TABLE)
      .select("id, estado")
      .eq("id", rol_id)
      .maybeSingle();

    if (errRol) throw errRol;
    if (!rol) {
      const e: any = new Error("Rol no encontrado.");
      e.statusCode = 404;
      throw e;
    }
    if (rol.estado === false) {
      const e: any = new Error("No se puede asignar un rol inactivo.");
      e.statusCode = 409;
      throw e;
    }

    // 3) Upsert (1 rol por usuario)
    // Requiere unique(usuario_id) en tabla usuario_rol
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .upsert([{ usuario_id, rol_id }], { onConflict: "usuario_id" })
      .select("*")
      .single();

    if (error) throw error;
    return mapRowToUsuarioRol(data);
  },

  /**
   * Obtiene la asignación usuario_rol por usuario_id (si existe).
   */
  async getByUserId(usuario_id: string): Promise<UsuarioRolDB | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("usuario_id", usuario_id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapRowToUsuarioRol(data) : null;
  },

  /**
   * Obtiene rol_id directamente por usuario_id (útil para middleware).
   */
  async getRoleIdByUserId(usuario_id: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("rol_id")
      .eq("usuario_id", usuario_id)
      .maybeSingle();

    if (error) throw error;
    return data?.rol_id ?? null;
  },

  /**
   * Elimina la asignación de rol de un usuario (si necesitas esta acción).
   */
  async removeByUserId(usuario_id: string): Promise<{ ok: true }> {
    const { error } = await supabaseAdmin.from(TABLE).delete().eq("usuario_id", usuario_id);
    if (error) throw error;
    return { ok: true };
  },
};
