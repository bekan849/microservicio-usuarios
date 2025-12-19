// src/controllers/permiso.controller.ts
import type { Request, Response, NextFunction } from "express";
import { permisoService } from "../services/permisoService";
import type { Modulo, PermisoUpsertInput } from "../types/Permiso";

/* ======================================================
   Helpers
====================================================== */
function isModulo(value: any): value is Modulo {
  const allowed: Modulo[] = [
    "USUARIOS",
    "USUARIO_ROL",
    "ROLES",
    "PERMISOS",
    "PRODUCTOS",
    "VEHICULOS",
    "CATEGORIAS",
    "SUBCATEGORIAS",
    "MARCAS",
    "PROVEEDORES",
    "COMPRAS",
    "VENTAS",
    "DETALLE_COMPRA",
    "DETALLE_VENTA",
    "CONFIG_GLOBAL",
  ];
  return typeof value === "string" && allowed.includes(value as Modulo);
}

/* ======================================================
   Controller
====================================================== */
export const permisoController = {
  // GET /permisos/rol/:rolId
  async getByRol(req: Request, res: Response, next: NextFunction) {
    try {
      const { rolId } = req.params;
      const data = await permisoService.getByRol(rolId);
      return res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  // GET /permisos/rol/:rolId/modulo/:modulo
  async getByRolAndModulo(req: Request, res: Response, next: NextFunction) {
    try {
      const { rolId, modulo } = req.params;

      if (!isModulo(modulo)) {
        return res.status(400).json({ message: "Módulo inválido." });
      }

      const permiso = await permisoService.getByRolAndModulo(rolId, modulo);
      if (!permiso) {
        return res.status(404).json({ message: "Permiso no encontrado." });
      }

      return res.status(200).json(permiso);
    } catch (err) {
      next(err);
    }
  },

  // POST /permisos/upsert
  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as PermisoUpsertInput;

      if (!body?.rol_id || typeof body.rol_id !== "string") {
        return res.status(400).json({ message: "rol_id es requerido." });
      }
      if (!isModulo(body?.modulo)) {
        return res.status(400).json({ message: "modulo inválido." });
      }

      const createdOrUpdated = await permisoService.upsert({
        rol_id: body.rol_id,
        modulo: body.modulo,
        puede_get: !!body.puede_get,
        puede_post: !!body.puede_post,
        puede_put: !!body.puede_put,
        puede_delete: !!body.puede_delete,
      });

      return res.status(200).json(createdOrUpdated);
    } catch (err) {
      next(err);
    }
  },

  // POST /permisos/upsert-many
  async upsertMany(req: Request, res: Response, next: NextFunction) {
    try {
      const items = req.body as PermisoUpsertInput[];

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Debe enviar un array de permisos." });
      }

      // Validación mínima de cada item
      for (const it of items) {
        if (!it?.rol_id || typeof it.rol_id !== "string") {
          return res.status(400).json({ message: "Cada permiso debe incluir rol_id." });
        }
        if (!isModulo(it?.modulo)) {
          return res.status(400).json({ message: `Modulo inválido: ${String(it?.modulo)}` });
        }
      }

      const saved = await permisoService.upsertMany(
        items.map((it) => ({
          rol_id: it.rol_id,
          modulo: it.modulo,
          puede_get: !!it.puede_get,
          puede_post: !!it.puede_post,
          puede_put: !!it.puede_put,
          puede_delete: !!it.puede_delete,
        }))
      );

      return res.status(200).json({ data: saved });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /permisos/rol/:rolId/modulo/:modulo
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { rolId, modulo } = req.params;

      if (!isModulo(modulo)) {
        return res.status(400).json({ message: "Módulo inválido." });
      }

      const result = await permisoService.remove(rolId, modulo);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
