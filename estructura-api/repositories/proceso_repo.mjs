import pool from "../config/database.mjs";
import Proceso from "../models/proceso_model.mjs";
import { sendStepEmail } from "../services/emailService.mjs";

const BASE_QUERY = `
  SELECT p.*,
         a.nombre AS animal_nombre, a.raza AS animal_raza,
         a.especie AS animal_especie, a.sexo AS animal_sexo,
         a.foto AS animal_foto, a.fecha_nacimiento AS animal_nacimiento,
         u.nombre AS usuario_nombre, u.email AS usuario_email,
         pr.id AS protectora_id, pr.nombre AS protectora_nombre,
         pr.direccion AS protectora_direccion, pr.telefono AS protectora_telefono,
         pr.email AS protectora_email, pr.descripcion AS protectora_descripcion,
         pr.pagina_web AS protectora_web
  FROM procesos p
  LEFT JOIN animales a  ON a.id  = p.animal_id
  LEFT JOIN usuarios u  ON u.id  = p.usuario_id
  LEFT JOIN protectoras pr ON pr.id = a.protectora_id
`;

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

  const protectora = r.protectora_nombre ? {
    id: r.protectora_id,
    nombre: r.protectora_nombre,
    direccion: r.protectora_direccion,
    telefono: r.protectora_telefono,
    email: r.protectora_email,
    descripcion: r.protectora_descripcion,
    pagina_web: r.protectora_web,
  } : null;

  return new Proceso(
    r.id, r.usuario_id, r.animal_id,
    r.confirmacion, r.revision, r.preparacion, r.preparativo, r.firma,
    r.fecha, animal, protectora
  );
};

const getProcesosByUsuario = async (usuario_id) => {
  const result = await pool.query(
    BASE_QUERY + ` WHERE p.usuario_id = $1 ORDER BY p.id ASC`,
    [usuario_id]
  );
  return result.rows.map(buildProceso);
};

const getAllProcesos = async () => {
  const result = await pool.query(BASE_QUERY + ` ORDER BY p.id DESC`);
  return result.rows.map(buildProceso);
};

const createProceso = async (usuario_id, animal_id) => {
  const existing = await pool.query(
    `SELECT id FROM procesos WHERE usuario_id = $1 AND animal_id = $2`,
    [usuario_id, animal_id]
  );
  if (existing.rows.length > 0) throw new Error('Ya tienes este animal en proceso de adopción');

  const result = await pool.query(
    `INSERT INTO procesos (usuario_id, animal_id, fecha) VALUES ($1, $2, NOW()) RETURNING *`,
    [usuario_id, animal_id]
  );

  await pool.query(`UPDATE animales SET disponible = false WHERE id = $1`, [animal_id]);

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

  if (newValue === true && idx > 0 && !row[STEP_ORDER[idx - 1]])
    throw new Error(`Debes completar primero: "${STEP_LABELS[idx - 1]}"`);
  if (newValue === false && idx < STEP_ORDER.length - 1 && row[STEP_ORDER[idx + 1]])
    throw new Error(`Debes desmarcar primero: "${STEP_LABELS[idx + 1]}"`);

  await pool.query(
    `UPDATE procesos SET ${field} = $1 WHERE id = $2`,
    [newValue, id]
  );

  const updated = await pool.query(BASE_QUERY + ` WHERE p.id = $1`, [id]);
  const proceso = buildProceso(updated.rows[0]);

  if (newValue === true) {
    sendStepEmail(
      field,
      updated.rows[0].usuario_email,
      updated.rows[0].usuario_nombre,
      updated.rows[0].animal_nombre
    );
  }

  return proceso;
};

const deleteProceso = async (id) => {
  await pool.query(`DELETE FROM procesos WHERE id = $1`, [id]);
};

export default {
  getProcesosByUsuario, getAllProcesos,
  createProceso, updateProcesoField, deleteProceso
};
