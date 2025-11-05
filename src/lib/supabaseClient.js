import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Erro: Variáveis do Supabase não foram carregadas.")
  console.log("URL:", SUPABASE_URL)
  console.log("KEY:", SUPABASE_ANON_KEY)
  throw new Error("Supabase URL e Key são obrigatórias.")
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
