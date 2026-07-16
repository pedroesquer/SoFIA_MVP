import { supabase } from './supabase';

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error('No fue posible obtener la sesión actual.');
  }

  if (!session?.access_token) {
    throw new Error('La sesión expiró. Inicia sesión nuevamente.');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);

  return fetch(input, {
    ...init,
    headers,
  });
}
