import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import rolRoutes from "./routes/roleRoutes";
import permisoRoutes from "./routes/permisoRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Ruta base opcional (para evitar 404 en raíz)
app.get("/", (_req, res) => {
  res.send("🚀 Microservicio de usuarios activo y corriendo");
});

// ✅ Rutas principales
app.use("/api/users", userRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/permisos", permisoRoutes);


// ✅ Middleware global de manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;
