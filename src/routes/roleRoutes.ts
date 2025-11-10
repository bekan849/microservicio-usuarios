import { Router } from "express";
import { createRole, getRoles } from "../controllers/roleController";

const router = Router();

router.post("/", createRole);
router.get("/", getRoles);

export default router;
