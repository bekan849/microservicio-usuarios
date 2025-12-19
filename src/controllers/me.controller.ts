// src/controllers/me.controller.ts
import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabaseClient";

const USERS_TABLE = "usuarios";
const USER_ROL_TABLE = "usuario_rol";
const ROLES_TABLE = "roles";
const PERMISOS_TABLE = "permisos";

export const meController = {
  // GET /me
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        return res.status(401).json({ message: "No autorizado." });
      }

      const user_id = req.auth.user_id;

      // 1) Usuario base
      const { data: user, error: errUser } = await supabaseAdmin
        .from(USERS_TABLE)
        .select(
          "id,nombre,apellido,email,telefono,direccion,estado,creado_en,auth_user_id"
        )
        .eq("id", user_id)
        .maybeSingle();

      if (errUser) throw errUser;
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado." });
      if (user.estado === false)
        return res.status(403).json({ message: "Usuario inactivo." });

      // 2) Rol (usuario_rol -> roles)
      const { data: ur, error: errUR } = await supabaseAdmin
        .from(USER_ROL_TABLE)
        .select(
          `rol_id, roles:${ROLES_TABLE}(id,nombre,descripcion,estado,creado_en)`
        )
        .eq("usuario_id", user_id)
        .maybeSingle();

      if (errUR) throw errUR;

      const rol = ur?.roles ?? null;
      const rol_id = ur?.rol_id ?? null;

      // 3) Permisos del rol (si no tiene rol, permisos = [])
      let permisos: any[] = [];
      if (rol_id) {
        const { data: perms, error: errPerms } = await supabaseAdmin
          .from(PERMISOS_TABLE)
          .select(
            "id,rol_id,modulo,puede_get,puede_post,puede_put,puede_delete"
          )
          .eq("rol_id", rol_id)
          .order("modulo", { ascending: true });

        if (errPerms) throw errPerms;
        permisos = perms ?? [];
      }

      // 4) Respuesta final
      return res.status(200).json({
        user,
        rol,
        permisos,
      });
    } catch (err) {
      next(err);
    }
  },
};
