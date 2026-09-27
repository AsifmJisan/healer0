import { Context, Next } from 'hono';
import { AuthVariables } from './auth';

const ROLE_HIERARCHY: Record<string, number> = {
  patient: 1,
  doctor: 2,
  researcher: 3,
  admin: 4,
  super_admin: 5,
};

export const requireRole = (minimumRole: string) => {
  return async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
    const user = c.get('user');
    const minRank = ROLE_HIERARCHY[minimumRole] || 999;
    const userRank = ROLE_HIERARCHY[user?.role] || 0;

    if (userRank < minRank) {
      return c.json({ error: 'Forbidden', message: 'Insufficient role permissions.' }, 403);
    }

    await next();
  };
};
