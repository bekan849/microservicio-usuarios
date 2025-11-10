import { Request, Response, NextFunction } from "express";

/**
 * authMiddleware: valida que el usuario esté autenticado.
 * En producción validarías el JWT de Supabase (en header: Authorization: Bearer <token>)
 * y luego podrías cargar userId y roles.
 *
 * Este archivo es un punto de partida.
 */

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No autorizado" });

    const token = auth.split(" ")[1];
    // TODO: verificar token con supabase/jwt library y extraer user id
    // const user = verifyToken(token);
    // req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
