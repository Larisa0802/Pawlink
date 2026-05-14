import express from "express";
import newsletterController from "../controllers/newsletter_controller.mjs";

const router = express.Router();

router.post("/suscribir", newsletterController.suscribir);
router.post("/contacto",  newsletterController.contacto);

export default router;
