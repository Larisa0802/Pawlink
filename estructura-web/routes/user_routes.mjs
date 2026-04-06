import { Router } from "express";
import userController from "../controllers/user_controller.mjs";

const router = Router();


router.get("/contacto", (req,res) => {
        const userData = req.cookies["datosUsuario"] || null;

    if (!userData) {
        return res.redirect("/login");
    }
    res.render("completes/contactos", {active:"contacto"})})
router.get("/adm", userController.getAllUsersFront)
router.get("/index", (req, res) => {

    const userData = req.cookies["datosUsuario"] || null;

    if (!userData) {
        return res.redirect("/login");
    }

    return res.render("completes/index", { userData, active:"inicio" });
});

router.get("/perfil", (req,res) => {
     const userData = req.cookies["datosUsuario"] || null;

    if (!userData) {
        return res.redirect("/login");
    }

    return res.render("completes/perfil", { userData, active:"perfil", errorD:null ,errorN:null, errorP:null, errorE:null, mensaje:null, openDeleteModal:null});
})

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


//DELETE
router.post("/usuarios/delete" , userController.deleteUser)
router.delete("/adm/users/:id", userController.deleteUserAsAdmin);


//CERRAR SESION
router.get("/logout", (req, res) => {
  res.render("completes/logout");
});
router.post("/signOutUser", userController.signOutUser);



/* router.post("/login-google", userController.loginGoogle);
 */

export default router;
