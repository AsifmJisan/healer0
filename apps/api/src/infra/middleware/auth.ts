import { Context, Next } from 'hono';
import { auth } from '../lib/auth';

export type AuthVariables = {
  user: any;
  session: any;
};

export async function requireAuth(c: Context<{ Variables: AuthVariables }>, next: Next) {
  const sessionData = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!sessionData?.user || !sessionData?.session) {
    return c.json({ error: 'Unauthorized', message: 'You must be logged in.' }, 401);
  }

  c.set('user', sessionData.user);
  c.set('session', sessionData.session);
  await next();
}

export async function requireActiveAccount(c: Context<{ Variables: AuthVariables }>, next: Next) {
  const user = c.get('user');
  if (user?.status !== 'active') {
    return c.json({ error: 'Forbidden', message: 'Account is not active.' }, 403);
  }
  await next();
}
