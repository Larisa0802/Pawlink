import express from "express";
import newsletterController from "../controllers/newsletter_controller.mjs";

const router = express.Router();

router.post("/suscribir", newsletterController.suscribir);

export default router;
