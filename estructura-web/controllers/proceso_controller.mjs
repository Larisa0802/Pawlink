import axios from "axios";

class ProcesoController {
  constructor() {
    this.client = axios.create({ baseURL: "http://localhost:3001" });
  }

  showProcesos = async (req, res) => {
    const userData = res.locals.userData;
    if (!userData) return res.redirect("/login");

    let procesos = [];
    try {
      const response = await this.client.get(`/procesos/${userData.id}`);
      procesos = Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (!error.response || error.response.status !== 404)
        console.error("Error al obtener procesos:", error.message);
    }

    res.render("completes/procesos", { active: "procesos", procesos });
  };

  adoptarAnimal = async (req, res) => {
    const userData = res.locals.userData;
    if (!userData) return res.redirect("/login");

    const animal_id = parseInt(req.body.animal_id, 10);
    if (!animal_id) return res.redirect("/vistaEleccion");

    try {
      await this.client.post("/procesos", { usuario_id: userData.id, animal_id });
      res.redirect("/procesos");
    } catch (error) {
      const msg = error.response?.data?.error || "Error al iniciar el proceso";
      res.redirect(`/adopciones?tipo=ambos&error=${encodeURIComponent(msg)}`);
    }
  };
}

export default new ProcesoController();
