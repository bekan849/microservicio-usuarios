// src/controllers/rol.controller.ts
import type { Request, Response, NextFunction } from "express";
import { rolService } from "../services/roleService";
import type { RolCreateInput, RolUpdateInput } from "../types/Rol";

/* ======================================================
   Helpers
====================================================== */
function parseBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return undefined;
}

function parseIntSafe(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/* ======================================================
   Controller
====================================================== */
export const rolController = {
  // GET /roles?page=1&limit=10&search=admin&estado=true
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseIntSafe(req.query.page, 1);
      const limit = parseIntSafe(req.query.limit, 10);
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const estado = parseBool(req.query.estado);

      const result = await rolService.getAll({ page, limit, search, estado });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // GET /roles/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const rol = await rolService.getById(id);

      if (!rol) {
        return res.status(404).json({ message: "Rol no encontrado." });
      }

      return res.status(200).json(rol);
    } catch (err) {
      next(err);
    }
  },

  // POST /roles
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as RolCreateInput;

      const created = await rolService.create(body);
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  // PUT /roles/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body as RolUpdateInput;

      const updated = await rolService.update(id, body);
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },

  // PATCH /roles/:id/estado
  async toggleEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const estado = parseBool(req.body?.estado);

      if (typeof estado !== "boolean") {
        return res.status(400).json({ message: "El campo 'estado' debe ser true o false." });
      }

      const updated = await rolService.toggleEstado(id, estado);
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /roles/:id
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await rolService.remove(id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
