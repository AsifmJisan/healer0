import { db } from './index';
import { users, accounts } from './schema/auth';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function main() {
  const superAdminPassword = bcrypt.hashSync('password123', 10);
  const adminPassword = bcrypt.hashSync('password123', 10);

  // Seed super_admin
  const existingSuperAdmin = await db.query.users.findFirst({ where: eq(users.email, 'superadmin@healer.app') });
  if (!existingSuperAdmin) {
    const [user] = await db.insert(users).values({
      name: 'Super Admin',
      email: 'superadmin@healer.app',
      emailVerified: true,
      role: 'super_admin',
      status: 'active',
    }).onConflictDoNothing().returning();
    
    if (user) {
      await db.insert(accounts).values({
        userId: user.id,
        accountId: 'superadmin@healer.app',
        providerId: 'credential',
        password: superAdminPassword
      }).onConflictDoNothing();
    }
  }

  // Seed admin
  const existingAdmin = await db.query.users.findFirst({ where: eq(users.email, 'admin@healer.app') });
  if (!existingAdmin) {
    const [user] = await db.insert(users).values({
      name: 'Admin',
      email: 'admin@healer.app',
      emailVerified: true,
      role: 'admin',
      status: 'active',
    }).onConflictDoNothing().returning();
    
    if (user) {
      await db.insert(accounts).values({
        userId: user.id,
        accountId: 'admin@healer.app',
        providerId: 'credential',
        password: adminPassword
      }).onConflictDoNothing();
    }
  }

  console.log('Seeding completed.');
}

main().catch(console.error).finally(() => process.exit(0));
