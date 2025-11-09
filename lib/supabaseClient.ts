import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis existem
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Função para testar a conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count')
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}