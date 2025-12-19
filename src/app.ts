import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes";
import rolRoutes from "./routes/roleRoutes";
import permisoRoutes from "./routes/permisoRoutes";
import usuarioRolRoutes from "./routes/usuariorolRoutes";
import meRoutes from "./routes/meRoutes";

import { errorHandler } from "./middleware/errorHandler";

const app = express();

// ✅ CORS (ajusta origin si quieres restringir al dominio del frontend)
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

// ✅ Ruta base opcional (para evitar 404 en raíz)
app.get("/", (_req, res) => {
  res.send("🚀 Microservicio de usuarios activo y corriendo");
});

// ✅ Rutas principales
app.use("/api/users", userRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/permisos", permisoRoutes);
app.use("/api/usuario-rol", usuarioRolRoutes);

// ✅ Perfil del usuario logueado (rol + permisos)
app.use("/api/me", meRoutes);

// ✅ 404 (cuando no existe la ruta)
app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada." });
});

// ✅ Middleware global de manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;
