import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim()

const PLACEHOLDER_KEY = 'your_publishable_key_here'

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('YOUR_PROJECT') &&
    supabaseUrl.startsWith('https://') &&
    supabaseKey !== PLACEHOLDER_KEY &&
    supabaseKey !== 'your_publishable_or_anon_key_here',
)

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] Missing configuration. Copy .env.example to .env and set VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY, then restart: npm run dev',
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://invalid.local',
  supabaseKey || 'invalid-key',
)
