import { Router } from "express";
import * as userController from "../controllers/user_controller.mjs";

const router = Router();

//GET
router.get ("/usuarios", userController.getAllUsersControl)
router.get("/getUserData/:id", userController.getUserData)

//POST
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/usuarios/nombre", userController.updateName) //Actualiza nombre


export default router;
