import db from "../config/database.mjs";

export const getUserByEmail = async (email) => {
  const query = "SELECT * FROM usuarios WHERE email = $1";
  const values = [email];

  const result = await db.query(query, values);
  return result.rows[0];
};

export const createUser = async ({ id, nombre, email }) => {
  const query = `
    INSERT INTO usuarios (id, nombre, email, fecha_registro)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, nombre, email
  `;

  const values = [id, nombre, email];

  const result = await db.query(query, values);
  return result.rows[0];
};
