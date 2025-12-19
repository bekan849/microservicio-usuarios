import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { authorize } from "../middleware/autorize.middleware";
import { userController } from "../controllers/userController";

const router = Router();

router.get("/", authMiddleware, authorize("USUARIOS"), userController.getAll);
router.get("/:id", authMiddleware, authorize("USUARIOS"), userController.getById);
router.post("/", authMiddleware, authorize("USUARIOS"), userController.create);
router.put("/:id", authMiddleware, authorize("USUARIOS"), userController.update);
router.patch("/:id/estado", authMiddleware, authorize("USUARIOS"), userController.toggleEstado);
router.delete("/:id", authMiddleware, authorize("USUARIOS"), userController.remove);

export default router;
