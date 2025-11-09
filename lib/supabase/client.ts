import { createClient } from "@supabase/supabase-js";

// 🚨 Certifique-se de ter o arquivo .env.local com as variáveis abaixo:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cria e exporta o cliente global do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
