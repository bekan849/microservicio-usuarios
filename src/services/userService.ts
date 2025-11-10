import { supabase, supabaseAdmin } from "../config/supabaseClient";
import { User } from "../types/User";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// 🧩 Esquema de validación con Zod
const userSchema = z.object({
  nombre: z.string().min(2, "Nombre demasiado corto"),
  apellido: z.string().min(2, "Apellido demasiado corto"),
  email: z.string().email("Email inválido"),
  telefono: z.string().nullable().optional(),
  direccion: z.string().nullable().optional(),
  estado: z.boolean().optional(),
  password: z.string().optional(),
});

export const userService = {
  /**
   * Obtener todos los usuarios con paginación, búsqueda y selección de campos
   */
  async getAll({
    page = 1,
    limit = 10,
    fields = "*",
    search = "",
  }: {
    page?: number;
    limit?: number;
    fields?: string;
    search?: string;
  }): Promise<{ data: User[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("usuarios").select(fields, { count: "exact" });

    if (search) {
      query = query.or(
        `nombre.ilike.%${search}%,apellido.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;
    // 👇 Cast seguro: convertimos data a unknown antes de User[]
    return { data: (data as unknown) as User[], total: count || 0 };
  },

  /**
   * Obtener usuario por ID
   */
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as User;
  },

  /**
   * Crear usuario (Auth + tabla usuarios)
   */
  async create(payload: Partial<User> & { password?: string }) {
    // ✅ Validación con manejo de errores bien tipado
    const parsed = userSchema.safeParse(payload);

    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      throw new Error(messages);
    }

    const { nombre, apellido, email, telefono, direccion, estado, password } =
      parsed.data;

    // ⚙️ Crear usuario en Supabase Auth (service_role)
    const pwd = password || Math.random().toString(36).slice(-8);
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: pwd,
        email_confirm: true,
      });

    if (authError) throw authError;

    const authUserId = (authData?.user?.id ||
      (authData as any).id) as string;

    // 🧱 Insertar registro en tabla usuarios
    const usuario = {
      id: uuidv4(),
      nombre: nombre.trim().toLowerCase(),
      apellido: apellido.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      telefono: telefono || null,
      direccion: direccion || null,
      estado: estado !== undefined ? estado : true,
      creado_en: new Date().toISOString(),
      auth_user_id: authUserId,
    };

    const { data, error } = await supabase
      .from("usuarios")
      .insert([usuario])
      .select()
      .single();

    if (error) {
      // 🧨 Rollback si falla inserción
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      throw error;
    }

    return data as User;
  },

  /**
   * Asignar un rol a un usuario
   */
  async assignRole(usuarioId: string, rolId: string) {
    const { data, error } = await supabase
      .from("usuario_rol")
      .insert([{ usuario_id: usuarioId, rol_id: rolId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtener permisos de usuario según sus roles
   */
  async getUserPermissions(usuarioId: string) {
    // 1️⃣ Obtener roles
    const { data: userRoles, error: roleErr } = await supabase
      .from("usuario_rol")
      .select("rol_id")
      .eq("usuario_id", usuarioId);

    if (roleErr) throw roleErr;

    const rolIds = (userRoles || []).map((r: any) => r.rol_id);
    if (rolIds.length === 0) return [];

    // 2️⃣ Obtener permisos
    const { data: permisos, error: permErr } = await supabase
      .from("permisos")
      .select("*")
      .in("rol_id", rolIds);

    if (permErr) throw permErr;

    return permisos;
  },
};
