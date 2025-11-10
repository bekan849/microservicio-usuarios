import { Router } from "express";
import { upsertPermiso, getByRole } from "../controllers/permisoController";

const router = Router();

router.post("/", upsertPermiso); // crear/actualizar permiso
router.get("/rol/:rolId", getByRole);

export default router;
