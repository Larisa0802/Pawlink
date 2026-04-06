import user_repository, * as userRepository from "../repositories/user_repository.mjs";
import { updateUserById } from "../repositories/user_repository.mjs";

//Registro
export const register = async (req, res) => {
  const { id, nombre, email } = req.body;

  console.log("API RECIBE:", req.body);

  //Comprobación de los campos introducidos
  if (!id || !nombre || !email) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  //Comprobacion de existencia del usuario
  const existing = await userRepository.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "El usuario ya existe" });
  }

  //Insercion del usuario en supabase (db)
  try {
    await userRepository.createUser({
      id,
      username: nombre,
      email,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error en Supabase: " + error.message });
  }

  res.status(201).json({ message: "Usuario registrado correctamente" });
};

//Inicio de sesion
export const login = async (req, res) => {
  const { email } = req.body;

  console.log("API RECIBE LOGIN (solo email):", req.body);

  //Comprobación de los campos introducidos
  if (!email) {
    return res.status(400).json({ message: "El email es obligatorio" });
  }

  try {
    //Buscar al usuario por email
    const user = await userRepository.getUserByEmail(email);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado en la base de datos" });
    }
    //Devolver los datos del usuario (en formato json)
    res.status(200).json({
      message: "Usuario verificado",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        admin: user.admin,
        fecha_registro: user.fecha_registro,
      },
    });
  } catch (error) {
    console.error("Error en login de la API:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getAllUsersControl = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    return res.status(200).json(users);
    console.log(users)
  } catch (err) {
    console.error(
      "Error en el controlador de obtencion de usuarios: ",
      err.message,
    );
    return res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

export const updateName = async (req, res) => {
  const { id, name } = req.body;

  //Comprobación de los campos introducidos
  if (!name || !id) {
    return res
      .status(400)
      .json({ message: "Los campos no pueden estar vacios" });
  }

  try {
    const result = await userRepository.updateUserNameById({
      id: id,
      nombre: name,
    });

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(
      "Error en el controlador de actualizar nombre: ",
      err.message,
    );
  }
};

export const updateEmail = async (req, res) => {
  const { id, email } = req.body;

  //Comprobación de los campos introducidos
  if (!email || !id) {
    return res
      .status(400)
      .json({ message: "Los campos no pueden estar vacios" });
  }

  try {
    const result = await userRepository.updateUserEmailById({
      id: id,
      email: email,
    });

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(
      "Error en el controlador de actualizar nombre: ",
      err.message,
    );
  }
};

export const updateUserAdmin = async (req, res) => {
    try {
        const { id, name, email, admin } = req.body;

        await updateUserById({
            id,
            name,
            email,
            admin
        });

        return res.json({ ok: true });

    } catch (err) {
        console.error("Error en updateUserAdmin:", err.message);
        return res.status(500).json({ error: "Error al actualizar usuario" });
    }
};



export const deleteUser = async (req,res) => {
      try{
          await userRepository.deleteUserById(req.body.id)
      }catch(error){
          console.log(error)
          res.send(error).status(500)
      }
      res.sendStatus(200)
}

//Obtener datos de usuario
export const getUserData = async (req, res) => {
  let user = undefined;
  try {
    user = await userRepo.selectUserById(req.params.id);
  } catch (error) {
    console.log(error);
    res.send(error).status(500);
  }
  res.send(user).status(200);
};
export const checkEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "El email es obligatorio" });
  }
  try {
    const user = await userRepository.getUserByEmail(email);
    if (user) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error en checkEmail de la API:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
