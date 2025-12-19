// src/routes/me.routes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { meController } from "../controllers/me.controller";

const router = Router();

// GET /api/me
router.get("/", authMiddleware, meController.getMe);

export default router;
