import { Router } from "express";
import animalController from "../controllers/animal_controller.mjs";

const router = Router();

router.get("/animales", animalController.getAllAnimales);
router.get("/animales/:id", animalController.getAnimalById);
router.get("/adopciones", (req, res) =>{
    res.render("completes/vistaEleccion")
})

export default router;
