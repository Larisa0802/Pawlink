import express from "express";
import cors from "cors";

import animalesRoutes from "./routes/animal_routes.mjs";

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors_config = {
  method: ["POST", "PUT", "GET", "DELETE"],
  origin: ["http://localhost:3001", "http://127.0.0.1:3001"]
};

app.use(cors(cors_config));

app.use(animalesRoutes);

app.listen(PORT, () => console.log("ESCUCHANDO EN", PORT));