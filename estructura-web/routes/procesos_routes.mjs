import express from "express";
import procesoController from "../controllers/proceso_controller.mjs";

const router = express.Router();

router.get("/procesos", procesoController.showProcesos);

export default router;
