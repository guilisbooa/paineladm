import { supabase } from "@/lib/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  created_at?: string;
  role?: string;
}

export const userService = {
  // 🔹 Buscar todos os usuários
  async getAll(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, phone, status, role, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao carregar usuários:", error.message);
        return [];
      }

      console.log("✅ Usuários carregados:", data?.length || 0);
      return data || [];
    } catch (err) {
      console.error("💥 Exceção ao buscar usuários:", err);
      return [];
    }
  },

  // 🔹 Criar novo usuário
  async create(user: Omit<User, "id" | "created_at">): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([user])
        .select()
        .single();

      if (error) {
        console.error("❌ Erro ao criar usuário:", error.message);
        return null;
      }

      console.log("✅ Usuário criado:", data);
      return data;
    } catch (err) {
      console.error("💥 Exceção ao criar usuário:", err);
      return null;
    }
  },

  // 🔹 Editar usuário existente
  async update(id: string, updates: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("❌ Erro ao atualizar usuário:", error.message);
        return false;
      }

      console.log("✅ Usuário atualizado:", id);
      return true;
    } catch (err) {
      console.error("💥 Exceção ao atualizar usuário:", err);
      return false;
    }
  },

  // 🔹 Deletar usuário
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);

      if (error) {
        console.error("❌ Erro ao deletar usuário:", error.message);
        return false;
      }

      console.log("🗑️ Usuário removido:", id);
      return true;
    } catch (err) {
      console.error("💥 Exceção ao deletar usuário:", err);
      return false;
    }
  },
};
