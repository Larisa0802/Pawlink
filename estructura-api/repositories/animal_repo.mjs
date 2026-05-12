import pool from "../config/database.mjs";
import Animal from "../models/animal_model.mjs";

//GET TODOS
const getAllAnimales = async () => {
const result = await pool.query(`
  SELECT * FROM animales
  WHERE especie IN ('Canina', 'Felina')
  ORDER BY CASE especie WHEN 'Canina' THEN 1 WHEN 'Felina' THEN 2 END, id ASC
  LIMIT 200
`);
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
    a.foto,
    a.nivel_energia,
    a.tamano,
    a.disponible
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
    a.foto,
  );
};

//FILTRO POR ESPECIE
const getByEspecie = async (especie) => {
  const result = await pool.query(
    "SELECT * FROM animales WHERE especie = $1",
    [especie]
  );
  return result.rows.map(a => new Animal(
    a.id, a.nombre, a.chip, a.especie, a.raza, a.sexo,
    a.fecha_nacimiento, a.color, a.pelaje, a.vacunas,
    a.esterilizado, a.desparasitado, a.foto
  ));
};

// Solo disponibles (para el catálogo público)
const getAllDisponibles = async () => {
  const result = await pool.query(
    `SELECT * FROM animales
     WHERE especie IN ('Canina','Felina') AND (disponible IS NULL OR disponible = true)
     ORDER BY CASE especie WHEN 'Canina' THEN 1 WHEN 'Felina' THEN 2 END, id ASC
     LIMIT 200`
  );
  return result.rows.map(a => new Animal(
    a.id, a.nombre, a.chip, a.especie, a.raza, a.sexo,
    a.fecha_nacimiento, a.color, a.pelaje, a.vacunas,
    a.esterilizado, a.desparasitado, a.foto
  ));
};

const getByEspecieDisponible = async (especie) => {
  const result = await pool.query(
    `SELECT * FROM animales WHERE especie = $1 AND (disponible IS NULL OR disponible = true)`,
    [especie]
  );
  return result.rows.map(a => new Animal(
    a.id, a.nombre, a.chip, a.especie, a.raza, a.sexo,
    a.fecha_nacimiento, a.color, a.pelaje, a.vacunas,
    a.esterilizado, a.desparasitado, a.foto
  ));
};

// FILTRO POR RAZA
const getByRaza = async (raza) => {
  const result = await pool.query(
    "SELECT * FROM animales WHERE raza = $1",
    [raza]
  );

  return result.rows;
};

//FILTRO POR PREFERENCIAS
const getMatches = async (preferencias, tipoElegido) => {
  let queryArgs = [];
  let queryConditions = [];
  let query = `SELECT animales.*, protectoras.nombre AS protectora_nombre 
    FROM animales 
    LEFT JOIN protectoras ON animales.protectora_id = protectoras.id 
    WHERE 1=1`;

  //filtro especie
  if (tipoElegido === "perros") {
    queryArgs.push("Canina");
    queryConditions.push(`especie = $${queryArgs.length}`);
  } else if (tipoElegido === "gatos") {
    queryArgs.push("Felina");
    queryConditions.push(`especie = $${queryArgs.length}`);
  }

  //filtro tamaño
  if (preferencias.tamano && preferencias.tamano !== "Indiferente") {
    queryArgs.push(preferencias.tamano);
    queryConditions.push(`tamano = $${queryArgs.length}`);
  }

  //filtro sexo
  if (preferencias.sexo && preferencias.sexo !== "Indiferente") {
    queryArgs.push(preferencias.sexo);
    queryConditions.push(`sexo = $${queryArgs.length}`);
  }

  //filtro energía
  if (preferencias.nivel_energia && preferencias.nivel_energia !== "Indiferente") {
    queryArgs.push(preferencias.nivel_energia);
    queryConditions.push(`nivel_energia = $${queryArgs.length}`);
  }

  //filtro edad
  if (preferencias.edad === "Senior") {
    queryConditions.push(`fecha_nacimiento < NOW() - INTERVAL '7 YEARS'`);
  } else if (preferencias.edad === "Adulto") {
    queryConditions.push(`fecha_nacimiento < NOW() - INTERVAL '1 YEAR' AND fecha_nacimiento >= NOW() - INTERVAL '7 YEARS'`);
  }

  //unir todas las condiciones
  if (queryConditions.length > 0) {
    query += " AND " + queryConditions.join(" AND ");
  }

  const result = await pool.query(query, queryArgs);
  return result.rows;
};

//UPDATE ANIMAL
const updateAnimal = async (id, datos) => {
  const { nombre, chip, especie, raza, sexo, fecha_nacimiento, pelaje, vacunas, esterilizado, desparasitado, tamano, nivel_energia, disponible } = datos;
  const result = await pool.query(
    `UPDATE animales SET nombre=$1, chip=$2, especie=$3, raza=$4, sexo=$5,
     fecha_nacimiento=$6, pelaje=$7, vacunas=$8, esterilizado=$9,
     desparasitado=$10, tamano=$11, nivel_energia=$12, disponible=$13
     WHERE id=$14 RETURNING *`,
    [nombre, chip, especie, raza, sexo, fecha_nacimiento, pelaje, vacunas, esterilizado, desparasitado, tamano, nivel_energia, disponible, id]
  );
  return result.rows[0];
};

//BORRAR
const deleteAnimal = async (id) => {
  const result = await pool.query("DELETE FROM animales WHERE id=$1 RETURNING *", [id]);
  return result.rows[0];
};

//CREAR 

export default {
  getAllAnimales,
  getAllDisponibles,
  getAnimalById,
  getByEspecie,
  getByEspecieDisponible,
  getByRaza,
  getMatches,
  updateAnimal,
  deleteAnimal,
};