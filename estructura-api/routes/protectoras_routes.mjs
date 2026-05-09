import { Router } from "express";
import * as protectorasController from "../controllers/protectoras_controller.mjs";

const router = Router();

router.get("/", protectorasController.getProtectorasConAnimales);
router.post("/", protectorasController.createProtectora);
router.post("/:id", protectorasController.updateProtectora);
router.delete("/:id", protectorasController.deleteProtectora);
export default router;