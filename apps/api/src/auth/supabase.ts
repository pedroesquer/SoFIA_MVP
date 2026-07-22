import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';

export function createRequestSupabaseClient(
  accessToken: string,
): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY no están configuradas.',
    );
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    realtime: {
      transport: ws,
    },
  });
}
