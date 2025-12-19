// src/middlewares/authorize.middleware.ts
import type { Request, Response, NextFunction } from "express";
import type { Modulo, PermisoDB } from "../types/Permiso";
import { permisoService } from "../services/permisoService";

function canAccess(method: string, permiso: PermisoDB): boolean {
  const m = method.toUpperCase();
  if (m === "GET") return permiso.puede_get;
  if (m === "POST") return permiso.puede_post;
  if (m === "PUT" || m === "PATCH") return permiso.puede_put;
  if (m === "DELETE") return permiso.puede_delete;
  return false;
}

export function authorize(modulo: Modulo) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Debe existir req.auth (puesto por authMiddleware)
      if (!req.auth) {
        return res.status(401).json({ message: "No autorizado: falta autenticación." });
      }

      const rol_id = req.auth.rol_id;
      if (!rol_id) {
        return res.status(403).json({ message: "Acceso denegado: usuario sin rol asignado." });
      }

      // Buscar permiso del rol para el módulo
      const permiso = await permisoService.getByRolAndModulo(rol_id, modulo);

      if (!permiso) {
        return res.status(403).json({
          message: `Acceso denegado: el rol no tiene permisos definidos para el módulo ${modulo}.`,
        });
      }

      // Validar por método HTTP
      if (!canAccess(req.method, permiso)) {
        return res.status(403).json({
          message: `Acceso denegado: no tienes permiso para ${req.method} en ${modulo}.`,
        });
      }

      // (Opcional) guardar permiso por si quieres usarlo después
      req.permiso = permiso;

      return next();
    } catch (err) {
      next(err);
    }
  };
}
