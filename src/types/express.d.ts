// src/types/express.d.ts
import type { AuthPayload } from "../middleware/authMiddleware";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export {};
