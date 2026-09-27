import { Context } from 'hono';
import type { AuthVariables } from '../../infra/middleware/auth';
import { PatientsService } from './patients.service';

export const PatientsController = {
  async list(c: Context<{ Variables: AuthVariables }>) {
    try {
      const result = await PatientsService.list();
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ error: 'Internal Server Error', message: error.message }, 500);
    }
  }
};
