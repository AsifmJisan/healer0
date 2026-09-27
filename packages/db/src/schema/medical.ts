import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const patientProfiles = pgTable('patient_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  dateOfBirth: timestamp('date_of_birth', { mode: 'date' }),
  bloodType: text('blood_type'),
  allergies: text('allergies').array(),
  medicalHistory: jsonb('medical_history'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export const doctorProfiles = pgTable('doctor_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  specialization: text('specialization').notNull(),
  licenseNumber: text('license_number').notNull(),
  hospitalAffiliation: text('hospital_affiliation'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export const researcherProfiles = pgTable('researcher_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  institution: text('institution').notNull(),
  researchField: text('research_field').notNull(),
  publications: jsonb('publications'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export type PatientProfile = typeof patientProfiles.$inferSelect;
export type NewPatientProfile = typeof patientProfiles.$inferInsert;
export type DoctorProfile = typeof doctorProfiles.$inferSelect;
export type NewDoctorProfile = typeof doctorProfiles.$inferInsert;
export type ResearcherProfile = typeof researcherProfiles.$inferSelect;
export type NewResearcherProfile = typeof researcherProfiles.$inferInsert;
