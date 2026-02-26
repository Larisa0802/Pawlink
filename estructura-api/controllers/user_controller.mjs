import * as userRepository from "../repositories/user_repository.mjs";

export const register = async (req, res) => {
  const { id, nombre, email } = req.body;

  console.log("API RECIBE:", req.body);

  if (!id || !nombre || !email) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  // 1. Comprobar si existe
  const existing = await userRepository.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "El usuario ya existe" });
  }

  // 2. Insertar en Supabase
  try {
    await userRepository.createUser({
      id,
      nombre,
      email
    });
  } catch (error) {
    return res.status(500).json({ message: "Error en Supabase: " + error.message });
  }

  res.status(201).json({ message: "Usuario registrado correctamente" });
};
