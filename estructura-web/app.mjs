import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import session from "express-session";
import { initializeApp } from "firebase/app";
import userRoutes from "./routes/user_routes.mjs";
import animalRoutes from "./routes/animal_routes.mjs";


const firebaseConfig = {
  apiKey:  process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

const firebase = initializeApp(firebaseConfig);

const PORT = 3000
const app = express()

const actualRoute = path.resolve(".")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




//session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-secreto',
  resave: false,
  saveUninitialized : false,
  cookie: {
    secure : false,
    maxAge: 1000 * 60 * 60 * 24
  }
}))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(actualRoute, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", userRoutes);
app.use("/", animalRoutes);


app.listen(PORT, ()=>{
    console.log(`El servidor esta escuchando en ${PORT}`)
})