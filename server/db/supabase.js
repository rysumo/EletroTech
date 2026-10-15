require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project') &&
  supabaseKey &&
  supabaseKey !== 'placeholder' &&
  supabaseKey !== 'your-supabase-anon-key'
);

if (!isSupabaseConfigured) {
  console.log('ℹ️ Supabase não configurado com credenciais válidas. Modo híbrido/fallback local (SQLite) ativo.');
}

const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseKey : 'placeholder',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

module.exports = { supabase, isSupabaseConfigured };
