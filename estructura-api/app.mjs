import express from "express";
import userRoutes from "./routes/user_routes.mjs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);

app.listen(3001, () => console.log("API en puerto 3001"));
