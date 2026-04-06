import { Router } from "express";
import * as userController from "../controllers/user_controller.mjs";
import db from "../config/database.mjs";

const router = Router();

//GET
router.get("/usuarios", userController.getAllUsersControl);
router.get("/getUserData/:id", userController.getUserData);

//POST
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/usuarios/nombre", userController.updateName); //Actualiza nombre
router.post("/usuarios/delete",userController.deleteUser)
router.post("/usuarios/email", userController.updateEmail); //Actualiza email
router.post("/usuarios/check-email", userController.checkEmail); //Comprueba existencia email
router.post("/usuarios/update-admin", userController.updateUserAdmin); //Actualiza datos como adm

/* router.post("/usuarios/delete",userController.deleteUser)
router.post("/login-google", async (req, res) => {
  const { email, nombre } = req.body;

  try {
    const user = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);

    let finalUser;

    if (user.rows.length === 0) {
      // Crear usuario nuevo SIN contraseña
      const nuevo = await db.query(
        "INSERT INTO usuarios (username, email, admin) VALUES ($1, $2, false) RETURNING *",
        [nombre, email]
      );
      finalUser = nuevo.rows[0];

    } else {
      const existing = user.rows[0];

      // Si tiene contraseña → NO permitir login Google
      if (existing.password && existing.password !== "") {
        return res.status(409).json({
          error: "Este email ya está registrado con contraseña. Usa el login normal."
        });
      }

      // Si no tiene contraseña → es usuario Google → permitir
      finalUser = existing;
    }

    return res.json({ user: finalUser });

  } catch (err) {
    console.error("Error en login-google:", err);
    return res.status(500).json({ error: "Error en login con Google" });
  }
});
 */

export default router;
