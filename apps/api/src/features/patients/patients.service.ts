import { db, users } from '@healer/db';
import { eq } from 'drizzle-orm';

export const PatientsService = {
  async list() {
    return db.query.users.findMany({ where: eq(users.role, 'patient') });
  }
};
