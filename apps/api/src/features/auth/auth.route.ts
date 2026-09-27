import { Hono } from 'hono';
import { auth } from '../../infra/lib/auth';

const authRouter = new Hono();
authRouter.on(['POST', 'GET'], '/*', (c) => {
  return auth.handler(c.req.raw);
});

export { authRouter };
