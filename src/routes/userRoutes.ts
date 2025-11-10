import { Router } from "express";
import { getUsers, createUser, assignRole, getUserPermissions } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);

// asignar rol a usuario
router.post("/assign-role", assignRole);

// obtener permisos consolidados de un usuario
router.get("/:id/permissions", getUserPermissions);

export default router;
