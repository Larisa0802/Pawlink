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
  deleteUser as deleteFirebaseUser,
} from "firebase/auth";

class UserController {
  constructor() {
    this.client = axios.create({
      baseURL: "http://localhost:3001",
    });
  }
  showRegisterForm = async (req, res) => {
    res.render("completes/register", { errorL: null });
  };

  //Enviar registro
  submitRegister = async (req, res) => {
    const { nombre, email, password } = req.body;

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

        //Enviamos el error directamente a la vista sin redirigir
        return res.render("completes/register", { errorL: { mensaje } });
      }

      const uid = firebaseData.localId;

      //Registro en la API (envia los datos puestos en el register)
      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: uid, nombre, email }),
      });

      const data = await response.json();

      //Registro exitoso
      if (response.ok) {
        return res.redirect("/login");
      } else {
        return res.render("completes/register", {
          errorL: { mensaje: data.message },
        });
      }
    } catch (error) {
      console.error("Error en registro:", error);
      return res.render("completes/register", {
        errorL: { mensaje: "Error de conexión con el servidor" },
      });
    }
  };

  showLoginForm = async (req, res) => {
    res.render("completes/login", { errorL: null });
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
            nombre: data.user.nombre,
            email: data.user.email,
            id: data.user.id,
            admin: data.user.admin,
            fecha: data.user.fecha,
          },
          { maxAge: 3600000 },
        );
        console.log(
          "Cookie de inicio de sesión: ",
          req.cookies["datosUsuario"],
        );
        //Redirige
        res.render("completes/provisional"); //Aqui iria el index
      } else {
        return res.render("completes/login", {
          errorL: { mensaje: "Error al recuperar datos: " + data.message },
        });
      }
    } catch (error) {
      console.error("Error en login:", error);
      return res.render("completes/login", {
        errorL: { mensaje: "Error de conexión" },
      });
    }
  };

  //Conseguir todos los usuarios
  getAllUsersFront = async (req, res) => {
    try {
      const response = await this.client.get("/usuarios");

      const usuarios = response.data;

      return res.render("completes/provisional", { usuarios });
    } catch (err) {
      console.error("Error en getAllUsersFront:", err.message);
      console.error(err.message);
    }
  };

  //Actualizar nombre
  updateName = async (req, res) => {
    const userData = req.cookies["datosUsuario"];
    try {
      if (!userData) {
        return res.status(401).json({ error: "No estas logueado" });
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

      console.log("Cookie actualizada al actualizar el nombre: ", userData);

      res.json({ mensaje: "Nombre actualizado correctamente" });
    } catch (err) {
      console.error("Error al consumir la API:", err.message);
      res.render("completes/provisional", {
        error: {
          mensaje: "Error al cambiar el nombre",
        },
      });
    }
  };

  //Actualizar email
  updateEmail = async (req, res) => {
    try {
      const userData = req.cookies["datosUsuario"];
      if (!userData) return res.status(401).json({ error: "No logueado" });

      const auth = getAuth();

      // Login para sesión válida con Firebase
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

      // Re-autenticación necesaria para cambiar el email en Firebase
      await reauthenticateWithCredential(user, credential);
      
      // Comprobar si el nuevo email ya existe en nuestra base de datos
      let existentEmail = await this.client.post("/usuarios/check-email", {
        email: req.body.email,
      });

      if (existentEmail.data.exists) {
        return res.status(409).json({ message: "Ese email ya está registrado en el sistema" });
      }

      // Cambiar email en Firebase (envía un correo de verificación)
      await verifyBeforeUpdateEmail(user, req.body.email);

      // Actualizar email en nuestra base de datos (PostgreSQL)
      await this.client.post("/usuarios/email", {
        id: userData.id,
        email: req.body.email,
      });

      // Actualizar la cookie con el nuevo email
      res.cookie("datosUsuario", {
        ...userData,
        email: req.body.email,
      });

      res.json({ mensaje: "Email actualizado correctamente. Se ha enviado un correo de verificación al nuevo email." });
    } catch (error) {
      console.error("Error al actualizar email:", error.message);
      res.status(500).send("Error al cambiar el email: " + error.message);
    }
  };



 updatePassword = async (req, res) => {
    try {
      const userData = req.cookies["datosUsuario"];

      if (!userData) { 
        return res.json({ error: "No estas logueado" });
      }

      const auth = getAuth();

      // Re-login para verificar contraseña
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userData.email,
        req.body.oldPass
      );

      const user = userCredential.user;

      await updatePassword(user, req.body.newPass);

      res.json({ mensaje: "Contraseña actualizada" });
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        return res.status(400).json({ error: "Contraseña incorrecta" });
      }
      console.error("Error al consumir la API:", error.message);
    }
  };
}
export default new UserController();
