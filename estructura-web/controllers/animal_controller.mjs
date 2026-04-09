import axios from "axios";

class AnimalController {
  constructor() {
    this.client = axios.create({
      baseURL: "http://localhost:3001",
    });
  }

  getAllAnimales = async (req, res) => {
    try {
      const response = await this.client.get("/animales");
      res.render("completes/catalogoAdopciones", { animales: response.data });
    } catch (error) {
      console.error("Error al obtener animales:", error.message);
      res.render("completes/catalogoAdopciones", { animales: [], error: "No se pudieron cargar los animales" });
    }
  };

  getAnimalById = async (req, res) => {
    try {
      const response = await this.client.get(`/animales/${req.params.id}`);
      res.render("completes/detalle", { animal: response.data });
    } catch (error) {
      console.error("Error al obtener animal:", error.message);
      res.status(404).render("completes/detalle", { animal: null, error: "Animal no encontrado" });
    }
  };
}

export default new AnimalController();