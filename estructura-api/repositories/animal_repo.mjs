import pool from "../config/database.mjs";
import Animal from "../models/animal_model.mjs";

//GET TODOS
const getAllAnimales = async () => {
  const result = await pool.query("SELECT * FROM animales");

  return result.rows.map(a => new Animal(
    a.id,
    a.nombre,
    a.chip,
    a.especie,
    a.raza,
    a.sexo,
    a.fecha_nacimiento,
    a.color,
    a.pelaje,
    a.vacunas,
    a.esterilizado,
    a.desparasitado,
    a.foto
  ));
};

//GET POR ID
const getAnimalById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM animales WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) return null;
  const a = result.rows[0];

  return new Animal(
    a.id,
    a.nombre,
    a.chip,
    a.especie,
    a.raza,
    a.sexo,
    a.fecha_nacimiento,
    a.color,
    a.pelaje,
    a.vacunas,
    a.esterilizado,
    a.desparasitado,
    a.foto
  );
};

//FILTRO POR ESPECIE
const getByEspecie = async (especie) => {
  const result = await pool.query(
    "SELECT * FROM animales WHERE especie = $1",
    [especie]
  );

  return result.rows;
};

// FILTRO POR RAZA
const getByRaza = async (raza) => {
  const result = await pool.query(
    "SELECT * FROM animales WHERE raza = $1",
    [raza]
  );

  return result.rows;
};

export default {
  getAllAnimales,
  getAnimalById,
  getByEspecie,
  getByRaza
};