import { Request, Response, NextFunction } from "express";
import { userService } from "../services/userService";
import { z } from "zod";

// 🧩 Schemas de validación de request
const getUsersSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});

const assignRoleSchema = z.object({
  usuarioId: z.string().uuid("Usuario ID inválido"),
  rolId: z.string().uuid("Rol ID inválido"),
});

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = getUsersSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message) });
    }

    const { page, limit, search } = parsed.data;

    const users = await userService.getAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || "",
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    // Manejo de errores de validación de Zod y Supabase
    res.status(400).json({ error: err.message || "Error al crear usuario" });
  }
};

export const assignRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = assignRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors.map(e => e.message) });
    }

    const { usuarioId, rolId } = parsed.data;
    const result = await userService.assignRole(usuarioId, rolId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID de usuario requerido" });

    const permisos = await userService.getUserPermissions(id);
    res.json(permisos);
  } catch (err) {
    next(err);
  }
};
