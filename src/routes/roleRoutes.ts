import { Router } from "express";
import { rolController } from "../controllers/roleController";
import { authMiddleware } from "../middleware/authMiddleware";
import { authorize } from "../middleware/autorize.middleware";

const router = Router();

/**
 * ROLES
 * Solo usuarios con permiso en módulo ROLES
 */

router.get(
  "/",
  authMiddleware,
  authorize("ROLES"),
  rolController.getAll
);

router.get(
  "/:id",
  authMiddleware,
  authorize("ROLES"),
  rolController.getById
);

router.post(
  "/",
  authMiddleware,
  authorize("ROLES"),
  rolController.create
);

router.put(
  "/:id",
  authMiddleware,
  authorize("ROLES"),
  rolController.update
);

router.patch(
  "/:id/estado",
  authMiddleware,
  authorize("ROLES"),
  rolController.toggleEstado
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("ROLES"),
  rolController.remove
);

export default router;
