import { Hono } from 'hono';
import { logger } from './infra/lib/logger';
import { authRouter } from './features/auth/auth.route';
import { patientsRouter } from './features/patients/patients.route';
import { systemRouter } from './features/system/system.route';
// Import other routes...

const app = new Hono().basePath('/api');

// Global middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info({
    method: c.req.method,
    url: c.req.url,
    status: c.res.status,
    duration: ms,
  });
});

// Mount routers
app.route('/auth', authRouter);
app.route('/patients', patientsRouter);
app.route('/system', systemRouter);
// Mount others...

export default app;
