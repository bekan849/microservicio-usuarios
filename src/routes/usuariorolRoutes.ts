import { Router } from "express";
import { usuarioRolController } from "../controllers/usuariorolController";
import { authMiddleware } from "../middleware/authMiddleware";
import { authorize } from "../middleware/autorize.middleware";
const router = Router();

/**
 * USUARIO_ROL
 * Protegido por permisos del módulo "USUARIO_ROL"
 * Normalmente solo ADMIN gestiona asignación de roles
 */

router.post(
  "/assign",
  authMiddleware,
  authorize("USUARIO_ROL"),
  usuarioRolController.assignRole
);

router.get(
  "/usuario/:usuarioId",
  authMiddleware,
  authorize("USUARIO_ROL"),
  usuarioRolController.getByUserId
);

router.get(
  "/usuario/:usuarioId/rol",
  authMiddleware,
  authorize("USUARIO_ROL"),
  usuarioRolController.getRoleIdByUserId
);

router.delete(
  "/usuario/:usuarioId",
  authMiddleware,
  authorize("USUARIO_ROL"),
  usuarioRolController.removeByUserId
);

export default router;
