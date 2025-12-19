// src/controllers/usuarioRol.controller.ts
import type { Request, Response, NextFunction } from "express";
import { usuarioRolService } from "../services/usuariorolService";
import type { UsuarioRolAssignInput } from "../types/UsuarioRol";

export const usuarioRolController = {
  // POST /usuario-rol/assign
  async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as UsuarioRolAssignInput;

      if (!body?.usuario_id || typeof body.usuario_id !== "string") {
        return res.status(400).json({ message: "usuario_id es requerido." });
      }
      if (!body?.rol_id || typeof body.rol_id !== "string") {
        return res.status(400).json({ message: "rol_id es requerido." });
      }

      const assigned = await usuarioRolService.assignRole({
        usuario_id: body.usuario_id,
        rol_id: body.rol_id,
      });

      return res.status(200).json(assigned);
    } catch (err) {
      next(err);
    }
  },

  // GET /usuario-rol/usuario/:usuarioId
  async getByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { usuarioId } = req.params;

      const rel = await usuarioRolService.getByUserId(usuarioId);
      if (!rel) {
        return res.status(404).json({ message: "El usuario no tiene rol asignado." });
      }

      return res.status(200).json(rel);
    } catch (err) {
      next(err);
    }
  },

  // GET /usuario-rol/usuario/:usuarioId/rol
  async getRoleIdByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { usuarioId } = req.params;

      const rol_id = await usuarioRolService.getRoleIdByUserId(usuarioId);
      if (!rol_id) {
        return res.status(404).json({ message: "El usuario no tiene rol asignado." });
      }

      return res.status(200).json({ rol_id });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /usuario-rol/usuario/:usuarioId
  async removeByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { usuarioId } = req.params;

      const result = await usuarioRolService.removeByUserId(usuarioId);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
