import type { RequestHandler } from 'express';
import type { UserRole } from '../../../../packages/domain/src/types';
import { createRequestSupabaseClient } from './supabase';

const VALID_ROLES = new Set<UserRole>([
  'Asesor',
  'Asesor Senior',
  'Administrador de Centro',
  'Superadministrador',
]);

export const authenticateRequest: RequestHandler = async (
  req,
  res,
  next,
) => {
  const authorization = req.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Se requiere una sesión autenticada.',
    });
  }

  const accessToken = authorization.slice('Bearer '.length).trim();

  if (!accessToken) {
    return res.status(401).json({
      error: 'El token de acceso está vacío.',
    });
  }

  try {
    const supabase = createRequestSupabaseClient(accessToken);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return res.status(401).json({
        error: 'La sesión es inválida o expiró.',
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, name, role, sede')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        error: 'La cuenta no tiene un perfil operativo autorizado.',
      });
    }

    if (!VALID_ROLES.has(profile.role as UserRole)) {
      return res.status(403).json({
        error: 'El perfil tiene un rol operativo inválido.',
      });
    }

    req.auth = {
      id: user.id,
      email: profile.email || user.email || '',
      name: profile.name,
      role: profile.role as UserRole,
      sede: profile.sede,
    };

    next();
  } catch (error) {
    console.error(
      'Error validando sesión de Supabase:',
      error instanceof Error ? error.message : error,
    );

    return res.status(503).json({
      error: 'No fue posible validar la sesión en este momento.',
    });
  }
};
