import db from "../config/database.mjs";


//Obtiene el user por email
export const getUserByEmail = async (email) => {
  const query = "SELECT * FROM usuarios WHERE email = $1";
  const values = [email];

  const result = await db.query(query, values);
  return result.rows[0];
};

//Crea el usuario
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

//Seleccionar usuario por id
export const selectUserById = async (id) => {
    const query = "SELECT * FROM usuarios WHERE id = $1";
    const values = [id];
    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error("Error al seleccionar usuario:", err.message);
        throw err;
    }
};

//Actualizar nombre de usuario por id
export const updateUserNameById = async (userData) => {
    const query = "UPDATE usuarios SET nombre = $1 WHERE id = $2";
    const values = [userData.nombre, userData.id];
    try {
        return await db.query(query, values);
    } catch (err) {
        console.error("Error al actualizar nombre:", err.message);
        throw err;
    }
};

//Actualizar el email por id
export const updateUserEmailById = async (userData) => {
    const query = "UPDATE usuarios set email = $1 WHERE id = $2;"
    const values = [userData.email, userData.id]

    try{
        return await db.query(query,values)
    }catch(err) {
        console.error("Error al actualizar el email:",err.message)
        throw err
    }

}

//Borrar usuario x id
export const deleteUserById = async (id) => {
    const query = "DELETE FROM usuarios WHERE id = $1";
    const values = [id];
    try {
        return await db.query(query, values);
    } catch (err) {
        console.error("Error al borrar usuario:", err.message);
        throw err;
    }
};


//Conseugir todos los usuarios de la BD
export const getAllUsers = async () => {
    const query = "SELECT * FROM usuarios"

    try{
        const result = await db.query(query)
        return result.rows
    }catch(err){
        console.error("Error al obtener los usuarios: ", err.message)
        throw err
    }
} 


export default {
    getUserByEmail,
    createUser,
    selectUserById,
    updateUserNameById,
    deleteUserById,
    getAllUsers,
    updateUserEmailById,
};
