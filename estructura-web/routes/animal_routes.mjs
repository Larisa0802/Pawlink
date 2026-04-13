import { Router } from "express";
import animalController from "../controllers/animal_controller.mjs";

const router = Router();

router.get("/animales", animalController.getAllAnimales);
router.get("/animales/:id", animalController.getAnimalById);
router.get("/vistaEleccion", (req, res) => {
    const userData = req.cookies["datosUsuario"] || null;

    if (!userData) {
        return res.redirect("/login");
    }

    res.render("completes/vistaEleccion", { userData, active: "vistaEleccion" });
});

router.get("/adopciones", animalController.getCatalogo);
router.post("/encuesta", animalController.enviarEncuesta);

export default router;
