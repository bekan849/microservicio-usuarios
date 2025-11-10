import { supabase } from "../config/supabaseClient";

export const permisoService = {
  async upsert(permiso: any) {
    // usa insert on conflict para upsert
    const { data, error } = await supabase.from("permisos").upsert(permiso).select().single();
    if (error) throw error;
    return data;
  },

  async getByRole(rolId: string) {
    const { data, error } = await supabase.from("permisos").select("*").eq("rol_id", rolId);
    if (error) throw error;
    return data;
  }
};
