import { FIREBASE_API_KEY } from "../config/keys.mjs";
export const showRegisterForm = (req, res) => {
  res.render("completes/register");
};

export const submitRegister = async (req, res) => {
  const { nombre, email, password } = req.body;

  console.log("WEB RECIBE:", req.body);

  // 1. Crear usuario en Firebase
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
    return res.send("Error en Firebase: " + firebaseData.error.message);
  }

  const uid = firebaseData.localId;

  // 2. Registrar en tu API
  const response = await fetch("http://localhost:3001/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: uid, nombre, email }),
  });

  const data = await response.json();

  res.send(data.message);
};
