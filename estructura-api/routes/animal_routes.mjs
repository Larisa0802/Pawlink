import express from "express";
const router = express.Router();

import animalesController from "../controllers/animal_controller.mjs";

//get todos
router.get("/animales", animalesController.getAllAnimales);

//get por id
router.get("/animales/:id", animalesController.getAnimalById);

//filtro especie
router.get("/animales/especie/:especie", animalesController.getByEspecie);

//filtro raza
router.get("/animales/raza/:raza", animalesController.getByRaza);

export default router;