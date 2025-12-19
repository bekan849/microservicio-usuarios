// src/controllers/user.controller.ts
import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/userService";
import type { UserCreateInput, UserUpdateInput } from "../types/User";

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
export const userController = {
  // GET /users?page=1&limit=10&search=juan&estado=true
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseIntSafe(req.query.page, 1);
      const limit = parseIntSafe(req.query.limit, 10);
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const estado = parseBool(req.query.estado);

      const result = await userService.getAll({ page, limit, search, estado });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // GET /users/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getById(id);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      return res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },

  // POST /users
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as UserCreateInput;

      // Si más adelante tienes auth middleware, aquí puedes leer el usuario logueado:
      // const createdBy = (req as any).user?.id ?? null;
      const createdBy = undefined;

      const created = await userService.create(body, { createdBy });
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  // PUT /users/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body as UserUpdateInput;

      const updated = await userService.update(id, body);
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },

  // PATCH /users/:id/estado
  async toggleEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const estado = parseBool(req.body?.estado);

      if (typeof estado !== "boolean") {
        return res.status(400).json({ message: "El campo 'estado' debe ser true o false." });
      }

      const updated = await userService.toggleEstado(id, estado);
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /users/:id
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await userService.remove(id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
