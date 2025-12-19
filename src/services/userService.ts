// src/services/user.service.ts
import { supabaseAdmin } from "../config/supabaseClient";
import type {
  UserDB,
  UserCreateInput,
  UserUpdateInput,
  UserWithRole,
} from "../types/User";

const USERS_TABLE = "usuarios";
const USER_ROL_TABLE = "usuario_rol";
const ROLES_TABLE = "roles";

/* ======================================================
   Helpers
====================================================== */
function normalizeText(v: string): string {
  return v.trim().toLowerCase();
}

function normalizePhone(v: string): string {
  return v.trim();
}

function mapRowToUserDB(row: any): UserDB {
  return {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    telefono: row.telefono,
    direccion: row.direccion ?? null,
    estado: row.estado ?? true,
    creado_en: row.creado_en,
    auth_user_id: row.auth_user_id ?? null
  };
}

function mapRowToUserWithRole(row: any): UserWithRole {
  // Dependiendo de cómo venga el join, roles puede venir como objeto o null.
  return {
    ...mapRowToUserDB(row),
    rol_id: row.usuario_rol?.rol_id ?? null,
    rol_nombre: row.usuario_rol?.roles?.nombre ?? null,
  };
}

/* ======================================================
   Service
====================================================== */
export const userService = {
  /**
   * Lista usuarios con paginación, búsqueda (nombre/apellido/email) y filtro estado.
   * Devuelve UserWithRole para que el frontend pinte rol sin hacer llamadas extra.
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: boolean;
  }): Promise<{
    data: UserWithRole[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(100, Math.max(1, params?.limit ?? 10));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Join: usuario_rol (1) -> roles (1)
    // OJO: Esto asume relación FK configurada en Supabase para poder hacer select anidado.
    let query = supabaseAdmin
      .from(USERS_TABLE)
      .select(
        `
        *,
        usuario_rol:usuario_rol (
          rol_id,
          roles:roles ( nombre )
        )
      `,
        { count: "exact" }
      )
      .order("creado_en", { ascending: false })
      .range(from, to);

    const search = (params?.search ?? "").trim();
    if (search) {
      // Buscamos por nombre/apellido/email
      // Supabase: OR con ilike
      query = query.or(
        `nombre.ilike.%${search}%,apellido.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (typeof params?.estado === "boolean") {
      query = query.eq("estado", params.estado);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data: (data ?? []).map(mapRowToUserWithRole),
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getById(id: string): Promise<UserWithRole | null> {
    const { data, error } = await supabaseAdmin
      .from(USERS_TABLE)
      .select(
        `
        *,
        usuario_rol:usuario_rol (
          rol_id,
          roles:roles ( nombre )
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapRowToUserWithRole(data) : null;
  },

  /**
   * Crea usuario:
   * 1) crea en Supabase Auth (service role)
   * 2) inserta en tabla usuarios con auth_user_id
   * 3) si falla el insert, borra el usuario auth creado (rollback)
   */
  async create(
    input: UserCreateInput,
    opts?: { createdBy?: string }
  ): Promise<UserDB> {
    const nombre = normalizeText(input.nombre);
    const apellido = normalizeText(input.apellido);
    const email = normalizeText(input.email);
    const telefono = normalizePhone(input.telefono);
    const direccion = input.direccion?.trim() || null;

    // Validar duplicado por email en tabla usuarios (extra)
    const { data: existing, error: errExisting } = await supabaseAdmin
      .from(USERS_TABLE)
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (errExisting) throw errExisting;
    if (existing) {
      const e: any = new Error("Ya existe un usuario con ese email.");
      e.statusCode = 409;
      throw e;
    }

    // 1) Crear en Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: input.password,
        email_confirm: true, // para no depender de confirmación
      });

    if (authError) throw authError;

    const auth_user_id = authData.user?.id ?? null;
    if (!auth_user_id) {
      const e: any = new Error(
        "No se pudo obtener auth_user_id al crear en Auth."
      );
      e.statusCode = 500;
      throw e;
    }

    // 2) Insertar en tabla usuarios
    const payload = {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      estado: true,
      auth_user_id,
    };

    const { data: row, error: insertError } = await supabaseAdmin
      .from(USERS_TABLE)
      .insert([payload])
      .select("*")
      .single();

    // 3) Rollback si falla insert
    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(auth_user_id);
      throw insertError;
    }

    return mapRowToUserDB(row);
  },

  /**
   * Actualiza datos del usuario (no password aquí).
   * - email NO se actualiza aquí (recomendado), porque está ligado a Auth.
   */
  async update(id: string, input: UserUpdateInput): Promise<UserDB> {
    const patch: Record<string, any> = {};

    if (input.nombre !== undefined) patch.nombre = normalizeText(input.nombre);
    if (input.apellido !== undefined)
      patch.apellido = normalizeText(input.apellido);
    if (input.telefono !== undefined)
      patch.telefono = normalizePhone(input.telefono);
    if (input.direccion !== undefined)
      patch.direccion = input.direccion?.trim() || null;
    if (typeof input.estado === "boolean") patch.estado = input.estado;

    if (Object.keys(patch).length === 0) {
      const e: any = new Error("No hay campos para actualizar.");
      e.statusCode = 400;
      throw e;
    }

    const { data, error } = await supabaseAdmin
      .from(USERS_TABLE)
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return mapRowToUserDB(data);
  },

  async toggleEstado(id: string, estado: boolean): Promise<UserDB> {
    const { data, error } = await supabaseAdmin
      .from(USERS_TABLE)
      .update({ estado })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return mapRowToUserDB(data);
  },

  /**
   * Recomendación: en vez de borrar, desactivar (estado=false).
   * Si igual quieres borrar:
   * - borra relación usuario_rol
   * - borra fila usuarios
   * - borra usuario en Auth
   */
  async remove(id: string): Promise<{ ok: true }> {
    // 1) Buscar usuario para obtener auth_user_id
    const { data: user, error: errUser } = await supabaseAdmin
      .from(USERS_TABLE)
      .select("id, auth_user_id")
      .eq("id", id)
      .maybeSingle();

    if (errUser) throw errUser;
    if (!user) {
      const e: any = new Error("Usuario no encontrado.");
      e.statusCode = 404;
      throw e;
    }

    const authId: string | null = user.auth_user_id ?? null;

    // 2) borrar usuario_rol
    const { error: errUR } = await supabaseAdmin
      .from(USER_ROL_TABLE)
      .delete()
      .eq("usuario_id", id);
    if (errUR) throw errUR;

    // 3) borrar usuarios
    const { error: errDelUser } = await supabaseAdmin
      .from(USERS_TABLE)
      .delete()
      .eq("id", id);
    if (errDelUser) throw errDelUser;

    // 4) borrar en Auth
    if (authId) {
      const { error: errAuthDel } = await supabaseAdmin.auth.admin.deleteUser(
        authId
      );
      if (errAuthDel) throw errAuthDel;
    }

    return { ok: true };
  },
};
