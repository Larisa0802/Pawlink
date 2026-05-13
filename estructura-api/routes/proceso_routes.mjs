import express from "express";
import procesoController from "../controllers/proceso_controller.mjs";

const router = express.Router();

router.get("/procesos",                procesoController.getAllProcesos);
router.get("/procesos/:usuario_id",    procesoController.getProcesosByUsuario);
router.post("/procesos",               procesoController.createProceso);
router.patch("/procesos/:id/toggle",   procesoController.toggleField);
router.delete("/procesos/:id",         procesoController.deleteProceso);

export default router;
