import { Router } from "express";
import userController from "../controllers/user_controller.mjs";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3001" });

const router = Router();


router.get("/contacto", (req, res) => {
    const userData = req.cookies["datosUsuario"] || null;

    if (!userData) {
        return res.redirect("/login");
    }
    res.render("completes/contactos", { active: "contacto" })
})
router.get("/adm", userController.getAllUsersFront)
router.get("/index", async (req, res) => {

    const userData = req.cookies["datosUsuario"] || null;

    if (!userData) {
        return res.redirect("/login");
    }

    try {
        // petición a la API para buscar las protectoras
        const response = await fetch("http://localhost:3001/api/protectoras");

        // Leemos las protectoras de la API si todo va bien
        let protectorasData = [];
        if (response.ok) {
            protectorasData = await response.json();
        }

        return res.render("completes/index", {
            userData,
            active: "inicio",
            protectoras: protectorasData
        });

    } catch (error) {
        // Entrará aquí si el servidor API está caído o si la ruta /api/protectoras aún no existe.
        console.error("Endpoint de protectoras no creado todavía o apagado, pasando de largo...");
        return res.render("completes/index", { userData, active: "inicio", protectoras: [] });
    }
});

router.get("/perfil", (req, res) => {
    const userData = req.cookies["datosUsuario"] || null;

    if (!userData) {
        return res.redirect("/login");
    }

    return res.render("completes/perfil", { userData, active: "perfil", errorD: null, errorN: null, errorP: null, errorE: null, mensaje: null, openDeleteModal: null });
})

//--------------------------------------------------------------//
router.get("/politicaPrivacidad", (req, res) => {
    const userData = req.cookies["datosUsuario"] || null;
    res.render("completes/politicaPrivacidad", { userData, active: null });
});

router.get("/politicaCookies", (req, res) => {
    const userData = req.cookies["datosUsuario"] || null;
    res.render("completes/politicaCookies", { userData, active: null });
});

//--------------------------------------------------------------//
router.get("/forgot-password", userController.showForgotPasswordForm);
router.post("/forgot-password", userController.submitForgotPassword);

router.get("/register", userController.showRegisterForm); //Muestra
router.post("/register", userController.submitRegister); //Valida

router.get("/", userController.showLoginForm); //Muestra
router.get("/login", userController.showLoginForm); //Muestra
router.post("/login", userController.submitLogin); //Valida

//UPDATES
router.post("/usuarios/nombre", userController.updateName)
router.post("/usuarios/email", userController.updateEmail)
router.post("/usuarios/password", userController.updatePassword)
router.post("/adm/users", userController.createUserAsAdmin);
router.post("/adm/users/:id", userController.updateUserAsAdmin);
router.post("/avatar", userController.updateAvatar); //Actualiza avatar del usuario


//DELETE
router.post("/usuarios/delete", userController.deleteUser)
router.delete("/adm/users/:id", userController.deleteUserAsAdmin);

// Procesos (admin)
router.post("/adm/procesos", async (req, res) => {
    try {
        const r = await API.post("/procesos", req.body);
        res.json(r.data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});
router.patch("/adm/procesos/:id/toggle", async (req, res) => {
    try {
        const r = await API.patch(`/procesos/${req.params.id}/toggle`, req.body);
        res.json(r.data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete("/adm/procesos/:id", async (req, res) => {
    try {
        await API.delete(`/procesos/${req.params.id}`);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});


//CERRAR SESION
router.get("/logout", (req, res) => {
    res.render("completes/logout");
});
router.post("/signOutUser", userController.signOutUser);



/* router.post("/login-google", userController.loginGoogle);
 */

export default router;
