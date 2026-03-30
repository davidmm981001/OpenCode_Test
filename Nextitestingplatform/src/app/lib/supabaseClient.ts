import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    throw new Error(
      'Supabase is not configured. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your environment.',
    );
  }
  return client;
}

