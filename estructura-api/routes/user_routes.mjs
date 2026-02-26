import { Router } from "express";
import { register } from "../controllers/user_controller.mjs";

const router = Router();

router.post("/register", register);

export default router;
