import pool from "../config/database.mjs";
import Proceso from "../models/proceso_model.mjs";

const buildProceso = (r) => {
  const animal = r.animal_nombre ? {
    nombre: r.animal_nombre,
    raza: r.animal_raza,
    especie: r.animal_especie,
    sexo: r.animal_sexo,
    foto: r.animal_foto,
    fecha_nacimiento: r.animal_nacimiento
      ? new Date(r.animal_nacimiento).toLocaleDateString("es-ES")
      : null,
  } : null;

  return new Proceso(
    r.id, r.usuario_id, r.animal_id,
    r.confirmacion, r.revision, r.preparacion, r.preparativo, r.firma,
    r.fecha, animal
  );
};

const BASE_QUERY = `
  SELECT p.*,
         a.nombre AS animal_nombre, a.raza AS animal_raza,
         a.especie AS animal_especie, a.sexo AS animal_sexo,
         a.foto AS animal_foto, a.fecha_nacimiento AS animal_nacimiento,
         u.nombre AS usuario_nombre, u.email AS usuario_email
  FROM procesos p
  LEFT JOIN animales a ON a.id = p.animal_id
  LEFT JOIN usuarios u ON u.id = p.usuario_id
`;

const getProcesoByUsuario = async (usuario_id) => {
  const result = await pool.query(BASE_QUERY + ` WHERE p.usuario_id = $1 LIMIT 1`, [usuario_id]);
  if (result.rows.length === 0) return null;
  return buildProceso(result.rows[0]);
};

const getAllProcesos = async () => {
  const result = await pool.query(BASE_QUERY + ` ORDER BY p.id DESC`);
  return result.rows.map(buildProceso);
};

const createProceso = async (usuario_id, animal_id) => {
  const result = await pool.query(
    `INSERT INTO procesos (usuario_id, animal_id, fecha)
     VALUES ($1, $2, NOW()) RETURNING *`,
    [usuario_id, animal_id]
  );
  return buildProceso(result.rows[0]);
};

const STEP_ORDER  = ['confirmacion', 'revision', 'preparacion', 'preparativo', 'firma'];
const STEP_LABELS = ['Confirmación', 'Revisión veterinaria', 'Documentación', 'Preparativos', 'Firma'];

const updateProcesoField = async (id, field) => {
  if (!STEP_ORDER.includes(field)) throw new Error('Campo no permitido');

  const current = await pool.query(`SELECT * FROM procesos WHERE id = $1`, [id]);
  if (current.rows.length === 0) throw new Error('Proceso no encontrado');

  const row      = current.rows[0];
  const idx      = STEP_ORDER.indexOf(field);
  const newValue = !row[field];

  if (newValue === true && idx > 0 && !row[STEP_ORDER[idx - 1]]) {
    throw new Error(`Debes completar primero: "${STEP_LABELS[idx - 1]}"`);
  }
  if (newValue === false && idx < STEP_ORDER.length - 1 && row[STEP_ORDER[idx + 1]]) {
    throw new Error(`Debes desmarcar primero: "${STEP_LABELS[idx + 1]}"`);
  }

  const result = await pool.query(
    `UPDATE procesos SET ${field} = $1 WHERE id = $2 RETURNING *`,
    [newValue, id]
  );
  return buildProceso(result.rows[0]);
};

const deleteProceso = async (id) => {
  await pool.query(`DELETE FROM procesos WHERE id = $1`, [id]);
};

export default { getProcesoByUsuario, getAllProcesos, createProceso, updateProcesoField, deleteProceso };
