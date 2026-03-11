import { Router } from "express";
import userController from "../controllers/user_controller.mjs";

const router = Router();
console.log(">>> user_routes.mjs CARGADO");


router.get("/usuarios", userController.getAllUsersFront)

router.get("/register", userController.showRegisterForm); //Muestra
router.post("/register", userController.submitRegister); //Valida

router.get("/login", userController.showLoginForm); //Muestra
router.post("/login", userController.submitLogin); //Valida

router.post("/usuarios/nombre", userController.updateName)


export default router;
