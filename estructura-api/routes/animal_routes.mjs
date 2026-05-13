import express from "express";
const router = express.Router();

import animalesController from "../controllers/animal_controller.mjs";

router.get("/animales", animalesController.getAllAnimales);
router.get("/animales/especie/:especie", animalesController.getByEspecie);
router.get("/animales/raza/:raza", animalesController.getByRaza);
router.get("/animales/:id", animalesController.getAnimalById);
router.post("/animales", animalesController.createAnimal);
router.put("/animales/:id", animalesController.updateAnimal);
router.delete("/animales/:id", animalesController.deleteAnimal);
export default router;