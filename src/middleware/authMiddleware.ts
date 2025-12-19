// src/middlewares/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabaseClient";

const USERS_TABLE = "usuarios";
const USER_ROL_TABLE = "usuario_rol";

export type AuthPayload = {
  token: string;
  auth_user_id: string;   // id del usuario en Supabase Auth
  user_id: string;        // id del usuario en tu tabla usuarios
  email: string | null;
  rol_id: string | null;  // id del rol (desde usuario_rol)
};

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;

  const [type, token] = header.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;

  return token.trim();
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({ message: "No autorizado: falta Bearer token." });
    }

    // 1) Validar token con Supabase Auth
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData?.user) {
      return res.status(401).json({ message: "No autorizado: token inválido o expirado." });
    }

    const authUser = userData.user;
    const auth_user_id = authUser.id;
    const email = authUser.email ?? null;

    // 2) Buscar usuario en tu tabla `usuarios` por auth_user_id
    const { data: appUser, error: dbErr } = await supabaseAdmin
      .from(USERS_TABLE)
      .select("id, estado, auth_user_id, email")
      .eq("auth_user_id", auth_user_id)
      .maybeSingle();

    if (dbErr) throw dbErr;

    if (!appUser) {
      // El token es válido, pero tu BD no tiene usuario vinculado
      return res.status(403).json({
        message: "Acceso denegado: usuario no registrado en el sistema.",
      });
    }

    if (appUser.estado === false) {
      return res.status(403).json({
        message: "Acceso denegado: usuario inactivo.",
      });
    }

    // 3) Traer rol_id desde usuario_rol (si no tiene, rol_id será null)
    const { data: ur, error: urErr } = await supabaseAdmin
      .from(USER_ROL_TABLE)
      .select("rol_id")
      .eq("usuario_id", appUser.id)
      .maybeSingle();

    if (urErr) throw urErr;

    const rol_id = ur?.rol_id ?? null;

    // 4) Guardar en req para authorize()
    req.auth = {
      token,
      auth_user_id,
      user_id: appUser.id,
      email: email ?? appUser.email ?? null,
      rol_id,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}
