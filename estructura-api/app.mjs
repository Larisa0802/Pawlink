import express from "express";
import cors from "cors";
import userRoutes from "./routes/user_routes.mjs";

const PORT = 3001
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors_config = {
    methods : ["POST", "PUT", "GET", "DELETE"],
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
 }
app.use(cors(cors_config))
app.use(userRoutes);

app.listen(PORT, () => console.log("API ESCUCHANDO EN", PORT))