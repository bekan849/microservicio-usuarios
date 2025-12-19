import { Router } from "express";
import { permisoController } from "../controllers/permisoController";
import { authMiddleware } from "../middleware/authMiddleware";
import { authorize } from "../middleware/autorize.middleware";

const router = Router();

/**
 * PERMISOS
 * Protegido por permisos del módulo "PERMISOS"
 * (normalmente solo ADMIN debería tener esto)
 */

router.get(
  "/rol/:rolId",
  authMiddleware,
  authorize("PERMISOS"),
  permisoController.getByRol
);

router.get(
  "/rol/:rolId/modulo/:modulo",
  authMiddleware,
  authorize("PERMISOS"),
  permisoController.getByRolAndModulo
);

router.post(
  "/upsert",
  authMiddleware,
  authorize("PERMISOS"),
  permisoController.upsert
);

router.post(
  "/upsert-many",
  authMiddleware,
  authorize("PERMISOS"),
  permisoController.upsertMany
);

router.delete(
  "/rol/:rolId/modulo/:modulo",
  authMiddleware,
  authorize("PERMISOS"),
  permisoController.remove
);

export default router;
