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
      res.render("completes/catalogoAdopciones", { animales: response.data, active:"vistaEleccion" });
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
        active: "vistaEleccion",
        tipo,
        error: req.query.error || null,
      });
    } catch (error) {
      console.error("Error al obtener catálogo:", error.message);
      res.render("completes/catalogoAdopciones", {
        animales: [],
        userData,
        active: "vistaEleccion",
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

 getProtectoras = async (req,res) => {
  try {
    
    const userData = req.cookies["datosUsuario"] || null;

    if (!userData) {
        return res.redirect("/login");
    }
        // petición a la API para buscar las protectoras
        const response = await fetch("http://localhost:3001/api/protectoras");

        // Leemos las protectoras de la API si todo va bien
        let protectorasData = [];

        if (response.ok) {
            protectorasData = await response.json();
                console.log("➡️ Datos recibidos:", protectorasData);
        }

        return res.render("completes/adm", {
            userData,
            active: "adm",
            protectoras: protectorasData
        });

    } catch (error) {
        // Entrará aquí si el servidor API está caído o si la ruta /api/protectoras aún no existe.
        console.error("Endpoint de protectoras no creado todavía o apagado, pasando de largo...");
        return res.render("completes/index", { userData, active: "adm", protectoras: [] });
    }
}
  
}

const updateAnimal = async (req, res) => {
  try {
    const animal = await animalesRepository.updateAnimal(req.params.id, req.body);
    if (!animal) return res.status(404).json({ ok: false, message: "Animal no encontrado" });
    res.json({ ok: true, animal });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

const deleteAnimal = async (req, res) => {
  try {
    const animal = await animalesRepository.deleteAnimal(req.params.id);
    if (!animal) return res.status(404).json({ ok: false, message: "Animal no encontrado" });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};



export default new AnimalController();
