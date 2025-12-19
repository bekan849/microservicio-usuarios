// src/types/express-permiso.d.ts
import type { PermisoDB } from "../types/Permiso";

declare global {
  namespace Express {
    interface Request {
      permiso?: PermisoDB;
    }
  }
}

export {};
