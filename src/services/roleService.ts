import { supabase } from "../config/supabaseClient";

export const roleService = {
  async create(payload: { nombre: string; descripcion?: string }) {
    const { data, error } = await supabase.from("roles").insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase.from("roles").select("*");
    if (error) throw error;
    return data;
  }
};
