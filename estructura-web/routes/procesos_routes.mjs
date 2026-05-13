import express from "express";
import procesoController from "../controllers/proceso_controller.mjs";

const router = express.Router();

router.get("/procesos", procesoController.showProcesos);
router.post("/adoptar", procesoController.adoptarAnimal);

export default router;
