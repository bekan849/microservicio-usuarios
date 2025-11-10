import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const anonKey = process.env.SUPABASE_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

/**
 * Export two clients:
 * - supabase (anon key) para consultas normales
 * - supabaseAdmin (service_role) para acciones privilegiadas (crear usuarios en Auth)
 */
export const supabase = createClient(url, anonKey);
export const supabaseAdmin = createClient(url, serviceRoleKey);
