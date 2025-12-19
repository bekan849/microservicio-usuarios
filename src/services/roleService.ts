// src/services/rol.service.ts
import { supabaseAdmin } from "../config/supabaseClient";
import type { RolDB, RolCreateInput, RolUpdateInput, RolNombre } from "../types/Rol";

const TABLE = "roles";
const USER_ROL_TABLE = "usuario_rol";

/* ======================================================
   Helpers
====================================================== */
function normalizeRolNombre(nombre: string): RolNombre {
  const v = nombre.trim().toUpperCase();
  // Si usas union RolNombre, aseguramos que sea uno válido:
  const allowed: RolNombre[] = ["ADMIN", "INVENTARIO", "VENTAS", "VENDEDOR"];
  if (!allowed.includes(v as RolNombre)) {
    throw new Error(`Nombre de rol inválido: ${nombre}`);
  }
  return v as RolNombre;
}

function mapRowToRol(row: any): RolDB {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? null,
    estado: row.estado ?? true,
    creado_en: row.creado_en,
  } as RolDB;
}

/* ======================================================
   Service
====================================================== */
export const rolService = {
  /**
   * Lista roles con paginación, búsqueda y filtro de estado (opcional).
   * - search: busca por nombre (ilike)
   * - estado: true/false para filtrar
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: boolean;
  }): Promise<{ data: RolDB[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(100, Math.max(1, params?.limit ?? 10));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from(TABLE)
      .select("*", { count: "exact" })
      .order("creado_en", { ascending: false })
      .range(from, to);

    const search = (params?.search ?? "").trim();
    if (search) {
      query = query.ilike("nombre", `%${search}%`);
    }

    if (typeof params?.estado === "boolean") {
      query = query.eq("estado", params.estado);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data: (data ?? []).map(mapRowToRol),
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getById(id: string): Promise<RolDB | null> {
    const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRowToRol(data) : null;
  },

  /**
   * Crea un rol.
   * - Normaliza nombre (trim + UPPER)
   * - Evita duplicados por nombre
   * - estado default true si no viene definido en DB
   */
  async create(input: RolCreateInput): Promise<RolDB> {
    const nombre = normalizeRolNombre(input.nombre);
    const descripcion = input.descripcion?.trim() || null;

    // Verificar duplicado por nombre
    const { data: existing, error: errExisting } = await supabaseAdmin
      .from(TABLE)
      .select("id")
      .eq("nombre", nombre)
      .maybeSingle();
    if (errExisting) throw errExisting;
    if (existing) {
      const e: any = new Error(`Ya existe un rol con nombre ${nombre}`);
      e.statusCode = 409;
      throw e;
    }

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert([{ nombre, descripcion, estado: true }])
      .select("*")
      .single();

    if (error) throw error;
    return mapRowToRol(data);
  },

  /**
   * Actualiza un rol (nombre/descripcion/estado).
   * - si cambia nombre, valida y evita duplicado
   */
  async update(id: string, input: RolUpdateInput): Promise<RolDB> {
    const patch: Record<string, any> = {};

    if (typeof input.nombre === "string") {
      const nombre = normalizeRolNombre(input.nombre);

      // Evitar duplicado con otro id
      const { data: dup, error: errDup } = await supabaseAdmin
        .from(TABLE)
        .select("id")
        .eq("nombre", nombre)
        .neq("id", id)
        .maybeSingle();

      if (errDup) throw errDup;
      if (dup) {
        const e: any = new Error(`Ya existe otro rol con nombre ${nombre}`);
        e.statusCode = 409;
        throw e;
      }

      patch.nombre = nombre;
    }

    if (input.descripcion !== undefined) {
      patch.descripcion = input.descripcion?.trim() || null;
    }

    if (typeof input.estado === "boolean") {
      patch.estado = input.estado;
    }

    if (Object.keys(patch).length === 0) {
      const e: any = new Error("No hay campos para actualizar");
      e.statusCode = 400;
      throw e;
    }

    const { data, error } = await supabaseAdmin.from(TABLE).update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return mapRowToRol(data);
  },

  /**
   * Cambia estado activo/inactivo.
   */
  async toggleEstado(id: string, estado: boolean): Promise<RolDB> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update({ estado })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return mapRowToRol(data);
  },

  /**
   * Elimina un rol SOLO si no está asignado a ningún usuario.
   */
  async remove(id: string): Promise<{ ok: true }> {
    // Verificar si está en uso en usuario_rol
    const { count, error: errCount } = await supabaseAdmin
      .from(USER_ROL_TABLE)
      .select("id", { count: "exact", head: true })
      .eq("rol_id", id);

    if (errCount) throw errCount;
    if ((count ?? 0) > 0) {
      const e: any = new Error("No puedes eliminar este rol porque está asignado a usuarios.");
      e.statusCode = 409;
      throw e;
    }

    const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
    if (error) throw error;

    return { ok: true };
  },
};
