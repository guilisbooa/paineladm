import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função auxiliar para padronizar respostas
async function safeSelect(table: string) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.error(`❌ Erro ao buscar dados de ${table}:`, error.message);
    return [];
  }
  return data || [];
}

export const userService = {
  getAll: async () => await safeSelect("users"),
  create: async (data: any) => await supabase.from("users").insert([data]),
  update: async (id: string, data: any) =>
    await supabase.from("users").update(data).eq("id", id),
  delete: async (id: string) =>
    await supabase.from("users").delete().eq("id", id),
};

export const establishmentService = {
  getAll: async () => await safeSelect("establishments"),
  create: async (data: any) => await supabase.from("establishments").insert([data]),
  update: async (id: string, data: any) =>
    await supabase.from("establishments").update(data).eq("id", id),
  delete: async (id: string) =>
    await supabase.from("establishments").delete().eq("id", id),
};

export const driverService = {
  getAll: async () => await safeSelect("drivers"),
  create: async (data: any) => await supabase.from("drivers").insert([data]),
  update: async (id: string, data: any) =>
    await supabase.from("drivers").update(data).eq("id", id),
  delete: async (id: string) =>
    await supabase.from("drivers").delete().eq("id", id),
};

export const settingsService = {
  getAll: async () => await safeSelect("settings"),
  update: async (key: string, value: string) =>
    await supabase.from("settings").update({ value }).eq("key", key),
};
