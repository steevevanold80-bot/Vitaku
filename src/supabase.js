import { createClient } from '@supabase/supabase-js'
// Sans clés dans .env, l'application reste en mode local (localStorage), comme avant.
const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && key ? createClient(url, key) : null
