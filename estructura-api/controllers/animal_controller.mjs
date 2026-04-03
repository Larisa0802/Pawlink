import animalesRepository from "../repositories/animal_repo.mjs";

//GET TODOS
const getAllAnimales = async (req, res) => {
  try {
    const animales = await animalesRepository.getAllAnimales();
    res.json(animales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//GET POR ID
const getAnimalById = async (req, res) => {
  try {
    const animal = await animalesRepository.getAnimalById(req.params.id);

    if (!animal) {
      return res.status(404).json({ error: "Animal no encontrado" });
    }

    res.json(animal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//FILTRO ESPECIE
const getByEspecie = async (req, res) => {
  try {
    const animales = await animalesRepository.getByEspecie(req.params.especie);
    res.json(animales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//FILTRO RAZA
const getByRaza = async (req, res) => {
  try {
    const animales = await animalesRepository.getByRaza(req.params.raza);
    res.json(animales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllAnimales,
  getAnimalById,
  getByEspecie,
  getByRaza
};