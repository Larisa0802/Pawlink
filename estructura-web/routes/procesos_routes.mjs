import express from "express";

const router = express.Router();

router.get("/procesos", (req, res) => {
    // Como tienes el middleware en app.mjs que guarda userData en res.locals, 
    // solo tienes que pasar la propiedad "active" 
    res.render("completes/procesos", { active: "procesos" });
});

export default router;
