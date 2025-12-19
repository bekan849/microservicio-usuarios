// src/types/express.d.ts
import type { AuthPayload } from "../middlewares/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export {};
