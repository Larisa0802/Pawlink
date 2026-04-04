import { getAllUsers } from "../../estructura-api/repositories/user_repository.mjs";
import { FIREBASE_API_KEY } from "../config/keys.mjs";
import axios from "axios";
import {
  getAuth,
  signInWithEmailAndPassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  verifyBeforeUpdateEmail,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  deleteUser as deleteFirebaseUser,
} from "firebase/auth";

class UserController {
  constructor() {
    this.client = axios.create({
      baseURL: "http://localhost:3001",
    });
  }
  /** REGISTER **/
  showRegisterForm = async (req, res) => {
    res.render("completes/register", { errorL: null });
  };

  //Enviar registro
  submitRegister = async (req, res) => {
    let { nombre, email, password } = req.body;

    console.log("WEB RECIBE:", req.body);

    try {
      //Creación de user en firebase
      const firebaseResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        },
      );

      const firebaseData = await firebaseResponse.json();

      if (firebaseData.error) {
        let mensaje = "Error al registrar";
        const errorMsg = firebaseData.error.message;

        if (errorMsg === "EMAIL_EXISTS") {
          mensaje = "Ese email ya está en uso";
        } else if (errorMsg.includes("WEAK_PASSWORD")) {
          mensaje = "La contraseña debe tener al menos 6 caracteres";
        } else if (errorMsg === "INVALID_EMAIL") {
          mensaje = "El formato del email no es válido";
        }

        return res.render("completes/register", { errorL: { mensaje } });
      }

      const id = firebaseData.localId;
      const idToken = firebaseData.idToken;

      //Registro en la API (envia los datos puestos en el register)
      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, nombre, email }),
      });

      const data = await response.json();

      //Registro exitoso
      if (response.ok) {
        return res.render("completes/login", {
          errorL: { mensaje: null },
          mensaje: "Registro exitoso",
        });
      } else {
        //Borrar si no es exitoso
        await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${FIREBASE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          },
        );
        return res.render("completes/register", {
          errorL: { mensaje: "Error en el registro" },
        });
      }
    } catch (error) {
      console.error("Error en registro:", error);

      return res.render("completes/register", {
        errorL: { mensaje: "Error de conexión con el servidor" },
      });
    }
  };

  //**LOGIN **/
  showLoginForm = async (req, res) => {
    res.render("completes/login", { errorL: null, mensaje: null });
  };

  //Enviar login a firebase para autentificarnos y traer los datos.
  submitLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log("Recibo del front: ", req.body.email);

    try {
      //Autenticar en Firebase (enviamos los datos email y contraseña)
      const firebaseResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        },
      );

      const firebaseData = await firebaseResponse.json();

      //Si no es correcta la autentificacion
      if (firebaseData.error) {
        return res.render("completes/login", {
          errorL: { mensaje: "Credenciales incorrectas" },
          mensaje: null,
        });
      }

      //Si es correcta
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        //Crea la cookie
        res.cookie(
          "datosUsuario",
          {
            nombre: data.user.username,
            email: data.user.email,
            id: data.user.id,
            admin: data.user.admin,
            fecha: data.user.fecha_registro,
          },
          { maxAge: 3600000 },
        );

        //Depuracion
        req.cookies["datosUsuario"] = {
          nombre: data.user.username,
          email: data.user.email,
          id: data.user.id,
          admin: data.user.admin,
          fecha: data.user.fecha_registro,
        };

        console.log(
          "Cookie de inicio de sesión: ",
          req.cookies["datosUsuario"],
        );

        //Redirige
        return res.redirect("/index");
      } else {
        return res.render("completes/login", {
          errorL: { mensaje: "Error al recuperar datos: " + data.message },
          mensaje: null,
        });
      }
    } catch (error) {
      console.error("Error en login:", error);
      return res.render("completes/login", {
        errorL: { mensaje: "Error de conexión" },
        mensaje: null,
      });
    }
  };

  //** CERRAR SESION **/
  signOutUser = async (req, res) => {
    try {
      const auth = getAuth();
      let userCredential = await signOut(auth);
      res.clearCookie("datosUsuario");
      res.redirect("/login");
    } catch (error) {
      console.error("Error al consumir la API:", error.message);
      res.render("completes/logout", {
        errorL: {
          mensaje: "Error al cerrar sesión",
        },
      });
    }
  };

  //Conseguir todos los usuarios
  getAllUsersFront = async (req, res) => {
    try {
      const userData = req.cookies["datosUsuario"];
      let usuarios = [];

      //Solo obtener usuarios si es admin
      if (userData && userData.admin) {
        const response = await this.client.get("/usuarios");
        usuarios = response.data;
      }

      return res.render("completes/index", {
        usuarios,
        userData: req.cookies["datosUsuario"],
        errorL: null,
        mensaje: null,
      });
    } catch (err) {
      console.error("Error en getAllUsersFront:", err.message);
      return res.render("completes/index", {
        usuarios: [],
        userData: req.cookies["datosUsuario"],
        errorL: { mensaje: "Error al cargar los usuarios" },
        mensaje: null,
      });
    }
  };

  /** UPDATES **/
  //Actualizar nombre
  updateName = async (req, res) => {
    const userData = req.cookies["datosUsuario"];
    try {
      if (!userData) {
        return res.status(401).render("completes/login", {
          errorL: { mensaje: "No logueado" },
          mensaje: null,
        });
      }

      console.log(userData);
      let datos = await this.client.post("/usuarios/nombre", {
        id: userData.id,
        name: req.body.name,
      });

      //Actualizar cookie
      res.cookie("datosUsuario", {
        email: userData.email,
        id: userData.id,
        nombre: req.body.name,
        admin: userData.admin,
        fecha: userData.fecha,
      });

      userData.nombre = req.body.name;
      req.cookies["datosUsuario"] = userData;

      console.log(
        "Cookie actualizada al actualizar el nombre: ",
        req.cookies["datosUsuario"],
      );

      return res.render("completes/perfil", {
        userData,
        openDeleteModal: true,
        errorN: { mensaje: null },
        errorD: null,
        errorP: null,
        errorE:null,
        active: "perfil",
        mensaje: "Nombre de usuario cambiado con exito",
      });
    } catch (err) {
      console.error("Error al consumir la API:", err.message);

      if (err.status === 400) {
        res.render("completes/perfil", {
          active: "perfil",
          userData: req.cookies["datosUsuario"],
          openDeleteModal: true,
          mensaje:null,
          errorN: { mensaje: "Error al cambiar el nombre" },
          errorD: null,
          errorP:null,
          errorE:null,
        });
      }
    }
  };

  //Actualizar email
  updateEmail = async (req, res) => {
    try {
      const userData = req.cookies["datosUsuario"];

      if (!userData) {
        return res.status(401).render("completes/login", {
          errorL: { mensaje: "No logueado" },
          mensaje: null,
        });
      }

      const auth = getAuth();

      //Login para sesión válida con Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userData.email,
        req.body.pass,
      );

      const user = userCredential.user;

      const credential = EmailAuthProvider.credential(
        user.email,
        req.body.pass,
      );

      //Re-autenticación necesaria para cambiar el email en Firebase
      await reauthenticateWithCredential(user, credential);

      //Comprobar si el nuevo email ya existe en nuestra base de datos
      let existentEmail = await this.client.post("/usuarios/check-email", {
        email: req.body.email,
      });

      if (existentEmail.data.exists) {
        return res.status(409).render("completes/perfil", {
          active: "perfil",
          userData: req.cookies["datosUsuario"],
          openDeleteModal: true,
          mensaje: null,
          errorP: null,
          errorD: null,
          errorN: null,
          errorE: {mensaje: "El email introducido ya esta en uso"}
        });
      }

      //Cambiar email en Firebase (envía un correo de verificación)
      await verifyBeforeUpdateEmail(user, req.body.email);

      //Actualizar email en nuestra base de datos (PostgreSQL)
      await this.client.post("/usuarios/email", {
        id: userData.id,
        email: req.body.email,
      });

      //Actualizar la cookie con el nuevo email
      res.cookie("datosUsuario", {
        ...userData,
        email: req.body.email,
      });
      return res.render("completes/login", {
        mensaje:
          "Email actualizado correctamente. Se ha enviado un correo de verificación al nuevo email.",
        errorL: { mensaje: null },
      });
    } catch (error) {
      if (error.code === "auth/missing-password" || error.status === 400) {
        return res.render("completes/perfil", {
           active: "perfil",
          userData: req.cookies["datosUsuario"],
          openDeleteModal: true,
          mensaje: null,
          errorP: null,
          errorD: null,
          errorN: null,
          errorE: {mensaje: "Los campos no pueden estar vacios"}
        });
      }

      if (error.code === "auth/invalid-credential") {
        return res.render("completes/perfil", {
           active: "perfil",
          userData: req.cookies["datosUsuario"],
          openDeleteModal: true,
          mensaje: null,
          errorP: null,
          errorD: null,
          errorN: null,
          errorE: {mensaje: "Contraseña incorrecta"}
        });
      }

      if (error.code === "auth/email-already-in-use") {
        return res.render("completes/perfil", {
           active: "perfil",
          userData: req.cookies["datosUsuario"],
          openDeleteModal: true,
          mensaje: null,
          errorP: null,
          errorD: null,
          errorN: null,
          errorE: {mensaje: "El email introducido ya esta en uso"}
        });
      }

      console.error("Error al actualizar email:", error.message);
      res.status(500).send("Error al cambiar el email: " + error.message);
    }
  };

  //Actualizar contraseña
  updatePassword = async (req, res) => {
    let usuarios = [];

    try {
      const userData = req.cookies["datosUsuario"];
      if (!userData) {
        return res.status(401).render("completes/login", {
          errorL: { mensaje: "No logueado" },
          mensaje: null,
        });
      }
      if (userData && userData.admin) {
        const response = await this.client.get("/usuarios");
        usuarios = response.data;
      }
      //Solo obtener usuarios si es admin
      const auth = getAuth();

      // Re-login para verificar contraseña
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userData.email,
        req.body.oldPass,
      );

      const user = userCredential.user;

      await updatePassword(user, req.body.newPass);

      return res.render("completes/login", {
        errorL: {
          mensaje:
            "Contraseña actualizada correctamente. Vuelva a iniciar sesión.",
        },
        mensaje: null,
      });
    } catch (error) {
      //Comprobaciones
      if (error.code === "auth/invalid-credential") {
        return res.render("completes/perfil", {
            active: "perfil",
          userData: req.cookies["datosUsuario"],
          openDeleteModal: true,
          mensaje:null,
          errorP: { mensaje: "Contraseña incorrecta" },
          errorD: null,
          errorN: null,
          errorE:null,
        });
      }

      if (error.code === "auth/missing-password") {
        return res.render("completes/perfil", {
            active: "perfil",
          userData: req.cookies["datosUsuario"],
          openDeleteModal: true,
          mensaje:null,
          errorP: { mensaje: "Los campos deben estar rellenos" },
          errorD: null,
          errorN:null,
          errorE:null,
        });
      }

      if (error.code === "auth/weak-password") {
        return res.render("completes/perfil", {
         active: "perfil",
          userData: req.cookies["datosUsuario"],
          openDeleteModal: true,
          mensaje:null,
          errorP: { mensaje: "La contraseña debe ser mayor a 6 caracteres" },
          errorD: null,
          errorN:null,
          errorE:null,
      })
    }

      console.error("Error al consumir la API:", error.message);
    }
  };

  /** DELETES **/
  //Borrar usuario
  deleteUser = async (req, res) => {
    const userData = req.cookies["datosUsuario"];

    try {
      if (!userData) {
        return res.redirect("/");
      }

      const auth = getAuth();

      //Re-login para verificar identidad y obtener usuario autenticado
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userData.email,
        req.body.password,
      );

      const user = userCredential.user;
      console.log(user);

      if (userCredential) {
        //Borrar usuario de Firebase
        await deleteFirebaseUser(user);
        //Borrar usuario de bd
        await this.client.post("/usuarios/delete", { id: userData.id });

        //Borrar cookie
        res.clearCookie("datosUsuario");

        return res.render("completes/login", {
          mensaje: "Cuenta eliminada correctamente",
          errorL: { mensaje: null },
        });
      }
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        return res.render("completes/perfil", {
          userData,
          openDeleteModal: true,
          active: "perfil",
          errorD: {
            mensaje: "Contraseña incorrecta",
          },
          errorP:null,
          errorE:null,
          errorN:null,
          mensaje:null,
        });
      }

      if (error.code === "auth/missing-password") {
        return res.render("completes/perfil", {
          userData,
          openDeleteModal: true,
          active: "perfil",
          errorD: {
            mensaje: "Introduzca la contraseña",
          },
            errorP:null,
          errorE:null,
          errorN:null,
          mensaje:null,
        });
      }
      console.error("Error:", error.message);
      return res.status(500).json({ error: "Error al eliminar el usuario" });
    }
  };

  /** AUTH**/
  //Login con google (no implementado)
  /* loginGoogle = async (req, res) => {
    const { email, nombre, id } = req.body;

    try {
      const response = await fetch("http://localhost:3001/login-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nombre, id }),
      });

      const data = await response.json();

      if (response.ok) {
        res.cookie(
          "datosUsuario",
          {
            nombre: data.user.username,
            email: data.user.email,
            id: data.user.id,
            admin: data.user.admin,
            fecha: data.user.fecha_registro,
          },
          { maxAge: 3600000 },
        );

        return res.redirect("/provisional");
      }

      return res.render("completes/login", {
        errorL: { mensaje: "Error al iniciar sesión con Google" },
        mensaje: null,
      });
    } catch (error) {
      console.error(error);
      return res.render("completes/login", {
        errorL: { mensaje: "Error de conexión" },
        mensaje: null,
      });
    }
  }; */

  /** OTROS **/
  //Olvidar contraseña
  showForgotPasswordForm = (req, res) => {
    res.render("completes/forgot-password", { errorL: null, mensaje: null });
  };

  submitForgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
      //Comprobar si el email existe en la db
      const existe = await this.client.post("/usuarios/check-email", { email });

      if (!existe.data.exists) {
        return res.render("completes/forgot-password", {
          errorL: { mensaje: "No existe ninguna cuenta con ese email" },
          mensaje: null,
        });
      }

      //Si existe envia email
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);

      return res.render("completes/forgot-password", {
        errorL: null,
        mensaje: "Se ha enviado un enlace de recuperación a tu email",
      });
    } catch (error) {
      console.error(error);

      return res.render("completes/forgot-password", {
        errorL: { mensaje: "Error al enviar el correo" },
        mensaje: null,
      });
    }
  };
}
export default new UserController();
