import express from "express";
import userRoutes from "./routes/user_routes.mjs";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/users", userRoutes);

app.listen(3000, () => console.log("WEB en puerto 3000"));
