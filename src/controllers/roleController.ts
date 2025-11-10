import { Request, Response, NextFunction } from "express";
import { roleService } from "../services/roleService";

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rol = await roleService.create(req.body);
    res.status(201).json(rol);
  } catch (err) {
    next(err);
  }
};

export const getRoles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await roleService.getAll();
    res.json(roles);
  } catch (err) {
    next(err);
  }
};
