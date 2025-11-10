// src/server.ts
import dotenv from "dotenv";
dotenv.config(); // 🔹 Cargar variables antes de todo

import app from "./index"; // 🔹 Luego importas tu app configurada

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ User service running on http://localhost:${PORT}`);
});
