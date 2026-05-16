import express from "express";
import cors from "cors";
import userRoutes from "./routes/user_routes.mjs";
import animalesRoutes from "./routes/animal_routes.mjs";
import protectorasRoutes from "./routes/protectoras_routes.mjs";
import procesoRoutes from "./routes/proceso_routes.mjs";
import newsletterRoutes from "./routes/newsletter_routes.mjs";

const PORT = 3001
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors_config = {
    methods: ["POST", "PUT", "GET", "DELETE"],
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
}
app.use(cors(cors_config))
app.use(userRoutes);
app.use(animalesRoutes);
app.use("/api/protectoras", protectorasRoutes);
app.use(procesoRoutes);
app.use(newsletterRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});


app.listen(process.env.PORT)