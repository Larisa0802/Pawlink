import procesoRepo from "../repositories/proceso_repo.mjs";

const getProcesosByUsuario = async (req, res) => {
  try {
    const procesos = await procesoRepo.getProcesosByUsuario(req.params.usuario_id);
    res.json(procesos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllProcesos = async (req, res) => {
  try {
    const procesos = await procesoRepo.getAllProcesos();
    res.json(procesos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProceso = async (req, res) => {
  try {
    const { usuario_id, animal_id } = req.body;
    if (!usuario_id || !animal_id) return res.status(400).json({ error: "Faltan datos" });
    const proceso = await procesoRepo.createProceso(usuario_id, animal_id);
    res.status(201).json(proceso);
  } catch (error) {
    const status = error.message.includes('Ya tienes') ? 409 : 500;
    res.status(status).json({ error: error.message });
  }
};

const toggleField = async (req, res) => {
  try {
    const { field } = req.body;
    const proceso = await procesoRepo.updateProcesoField(req.params.id, field);
    res.json(proceso);
  } catch (error) {
    const status = error.message.includes('Debes') ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
};

const deleteProceso = async (req, res) => {
  try {
    await procesoRepo.deleteProceso(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { getProcesosByUsuario, getAllProcesos, createProceso, toggleField, deleteProceso };
