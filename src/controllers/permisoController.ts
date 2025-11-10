import { Request, Response, NextFunction } from "express";
import { permisoService } from "../services/permisoService";

export const upsertPermiso = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permiso = await permisoService.upsert(req.body);
    res.status(201).json(permiso);
  } catch (err) {
    next(err);
  }
};

export const getByRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rolId } = req.params;
    const permisos = await permisoService.getByRole(rolId);
    res.json(permisos);
  } catch (err) {
    next(err);
  }
};
