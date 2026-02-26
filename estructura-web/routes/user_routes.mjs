import { Router } from "express";
import { showRegisterForm, submitRegister } from "../controllers/user_controller.mjs";

const router = Router();

router.get("/register", showRegisterForm);
router.post("/register", submitRegister);

export default router;
