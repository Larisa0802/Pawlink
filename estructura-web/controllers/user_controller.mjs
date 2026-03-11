import { getAllUsers } from "../../estructura-api/repositories/user_repository.mjs";
import { FIREBASE_API_KEY } from "../config/keys.mjs";
import axios from "axios";

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

    console.log("Recibo del front: ", req.body);

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
        console.log("Cookie de inicio de sesión: ", req.cookies["datosUsuario"])
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

      console.log("Cookie actualizada al actualizar el nombre: ", userData)

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
  updateEmail = async (req,res) => {
    const userData = req.cookies['datosUsuario']



  }
}

export default new UserController();
