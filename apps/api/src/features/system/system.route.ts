import { Hono } from 'hono';

const systemRouter = new Hono();

systemRouter.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { systemRouter };
