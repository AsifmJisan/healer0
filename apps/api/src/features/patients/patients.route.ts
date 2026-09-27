import { Hono } from 'hono';
import { requireAuth, requireActiveAccount } from '../../infra/middleware/auth';
import { requireRole } from '../../infra/middleware/role';
import { PatientsController } from './patients.controller';

const patientsRouter = new Hono();

patientsRouter.use('*', requireAuth, requireActiveAccount);
patientsRouter.get('/', requireRole('admin'), PatientsController.list);

export { patientsRouter };
