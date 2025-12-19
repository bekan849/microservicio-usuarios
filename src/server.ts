import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = process.env.PORT || 4000;

app.set("trust proxy", 1);

app.listen(PORT, () => {
  console.log(`✅ User service running on http://localhost:${PORT}`);
});
