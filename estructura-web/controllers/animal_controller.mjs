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

  vistaEleccion = (req, res) => {
    res.render("completes/vistaEleccion");
  };

  getCatalogo = async (req, res) => {
    /*debug
    console.log(">>> getCatalogo called"); */
    const userData = req.cookies["datosUsuario"] || null;

    if (!userData) {
      return res.redirect("/login");
    }

    const tipo = req.query.tipo || "ambos";

    // Mapeamos el query param al valor real de la BD
    const mapaEspecie = {
      perros: "Canina",
      gatos: "Felina",
    };

    try {
      let response;

      /*console.log("Tipo:", tipo);*/

      if (tipo === "ambos") {
        response = await this.client.get("/animales");
      } else {
        const especie = mapaEspecie[tipo];
        response = await this.client.get(`/animales/especie/${especie}`);
      }

      console.log("Datos recibidos:", response.data);

      res.render("completes/catalogoAdopciones", {
        animales: response.data,
        userData,
        active: "adopciones",
        tipo,
        error: null,
      });
    } catch (error) {
      console.error("Error al obtener catálogo:", error.message);
      res.render("completes/catalogoAdopciones", {
        animales: [],
        userData,
        active: "adopciones",
        tipo,
        error: "No se pudieron cargar los animales",
      });
    }
  };

  enviarEncuesta = async (req, res) => {
    const userData = req.cookies["datosUsuario"] || null;

    if (!userData) {
      return res.redirect("/login");
    }

    const { tamano, nivel_energia, edad, sexo, tipo } = req.body;

    try {
      const response = await this.client.post("/encuesta", {
        userId: userData.id,
        tamano,
        nivel_energia,
        edad,
        sexo,
        tipo,
      });

      userData.encuesta_realizada = true;

      res.cookie("datosUsuario", userData, { maxAge: 1000 * 60 * 60 * 24 });

      res.render("completes/vistaEleccion", {
        userData,
        active: "adopciones",
        matches: response.data.matches,
        tipoElegido: tipo
      });
    } catch (error) {
      console.error("Error al enviar la encuesta:", error.message);
      res.redirect("/vistaEleccion");
    }
  }
}

export default new AnimalController();
