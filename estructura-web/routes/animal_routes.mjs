import { Router } from "express";
import animalController from "../controllers/animal_controller.mjs";

const router = Router();

router.post("/adm/animales/:id", async (req, res) => {
  try {
    const response = await fetch(`http://localhost:3001/animales/${req.params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.delete("/adm/animales/:id", async (req, res) => {
  try {
    const response = await fetch(`http://localhost:3001/animales/${req.params.id}`, {
      method: "DELETE"
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});
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
router.get("/animales", animalController.getAllAnimales);

export default router;
