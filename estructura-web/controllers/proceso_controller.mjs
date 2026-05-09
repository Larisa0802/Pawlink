import axios from "axios";

class ProcesoController {
  constructor() {
    this.client = axios.create({ baseURL: "http://localhost:3001" });
  }

  showProcesos = async (req, res) => {
    const userData = res.locals.userData;
    if (!userData) return res.redirect("/login");

    let proceso = null;
    try {
      const response = await this.client.get(`/procesos/${userData.id}`);
      proceso = response.data;
    } catch (error) {
      if (!error.response || error.response.status !== 404) {
        console.error("Error al obtener proceso:", error.message);
      }
    }

    res.render("completes/procesos", { active: "procesos", proceso });
  };
}

export default new ProcesoController();
