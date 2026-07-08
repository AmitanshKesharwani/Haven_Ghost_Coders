import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || SUPABASE_URL === 'your_supabase_url_here') {
  console.error('❌ VITE_SUPABASE_URL is not configured. Add it to your .env file.');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not configured. Add it to your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
