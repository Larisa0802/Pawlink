import { Router } from "express";
import * as protectorasController from "../controllers/protectoras_controller.mjs";

const router = Router();

router.get("/", protectorasController.getProtectorasConAnimales);

export default router;