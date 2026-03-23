import { Router } from "express";
import userController from "../controllers/user_controller.mjs";

const router = Router();

router.get("/usuarios", userController.getAllUsersFront)
router.get("/provisional", (req, res) => {
  res.render("completes/provisional", {
    errorL: null,
    mensaje: null
  });
});

router.get("/register", userController.showRegisterForm); //Muestra
router.post("/register", userController.submitRegister); //Valida

router.get("/", userController.showLoginForm); //Muestra
router.post("/login", userController.submitLogin); //Valida

//UPDATES
router.post("/usuarios/nombre", userController.updateName)
router.post("/usuarios/email", userController.updateEmail)
router.post("/usuarios/password", userController.updatePassword)


export default router;
