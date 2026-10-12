import { pgTable, text, timestamp, integer, jsonb, boolean, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { researcherProfiles } from './medical';

// ─── Research Projects (Clinical Studies / Trials) ──────────────────────────
export const researchProjects = pgTable('research_projects', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  researcherId: text('researcher_id').notNull().references(() => researcherProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  researchArea: text('research_area').notNull(),
  description: text('description'),
  protocolNumber: text('protocol_number'),
  status: text('status').notNull().default('draft'),
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' }),
  targetSampleSize: integer('target_sample_size').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Research Participants (Anonymized Cohort Members) ──────────────────────
export const researchParticipants = pgTable('research_participants', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id').notNull().references(() => researchProjects.id, { onDelete: 'cascade' }),
  participantCode: text('participant_code').notNull(),
  ageGroup: text('age_group'),
  gender: text('gender'),
  eligibilityStatus: text('eligibility_status').notNull().default('pending'),
  consentStatus: text('consent_status').notNull().default('pending'),
  joinedDate: timestamp('joined_date', { mode: 'date' }).defaultNow().notNull(),
});

// ─── Research Surveys (Psychometric Instruments) ────────────────────────────
export const researchSurveys = pgTable('research_surveys', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id').notNull().references(() => researchProjects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  questionCount: integer('question_count').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ─── Survey Questions ───────────────────────────────────────────────────────
export const surveyQuestions = pgTable('survey_questions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  surveyId: text('survey_id').notNull().references(() => researchSurveys.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  questionType: text('question_type').notNull().default('likert_5'),
  options: jsonb('options'),
});

// ─── Research Data Collection (Anonymized Observations) ─────────────────────
export const researchDataCollection = pgTable('research_data_collection', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id').notNull().references(() => researchProjects.id, { onDelete: 'cascade' }),
  participantId: text('participant_id').notNull().references(() => researchParticipants.id, { onDelete: 'cascade' }),
  dataType: text('data_type').notNull(),
  dataValue: jsonb('data_value'),
  collectedDate: timestamp('collected_date', { mode: 'date' }).defaultNow().notNull(),
});

// ─── Research Analytics (Generated Summaries & Reports) ─────────────────────
export const researchAnalytics = pgTable('research_analytics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id').notNull().references(() => researchProjects.id, { onDelete: 'cascade' }),
  analysisType: text('analysis_type').notNull(),
  metricsSummary: jsonb('metrics_summary'),
  generatedReport: text('generated_report'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ─── Research Papers (Literature Reference Library) ─────────────────────────
export const researchPapers = pgTable('research_papers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  researcherId: text('researcher_id').notNull().references(() => researcherProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  authors: text('authors'),
  journalName: text('journal_name'),
  publicationYear: integer('publication_year'),
  paperUrl: text('paper_url'),
  doi: text('doi'),
  addedDate: timestamp('added_date', { mode: 'date' }).defaultNow().notNull(),
});

// ─── Drizzle Relations ──────────────────────────────────────────────────────

export const researchProjectsRelations = relations(researchProjects, ({ one, many }) => ({
  researcher: one(researcherProfiles, {
    fields: [researchProjects.researcherId],
    references: [researcherProfiles.id],
  }),
  participants: many(researchParticipants),
  surveys: many(researchSurveys),
  dataCollection: many(researchDataCollection),
  analytics: many(researchAnalytics),
}));

export const researchParticipantsRelations = relations(researchParticipants, ({ one, many }) => ({
  project: one(researchProjects, {
    fields: [researchParticipants.projectId],
    references: [researchProjects.id],
  }),
  dataCollection: many(researchDataCollection),
}));

export const researchSurveysRelations = relations(researchSurveys, ({ one, many }) => ({
  project: one(researchProjects, {
    fields: [researchSurveys.projectId],
    references: [researchProjects.id],
  }),
  questions: many(surveyQuestions),
}));

export const surveyQuestionsRelations = relations(surveyQuestions, ({ one }) => ({
  survey: one(researchSurveys, {
    fields: [surveyQuestions.surveyId],
    references: [researchSurveys.id],
  }),
}));

export const researchDataCollectionRelations = relations(researchDataCollection, ({ one }) => ({
  project: one(researchProjects, {
    fields: [researchDataCollection.projectId],
    references: [researchProjects.id],
  }),
  participant: one(researchParticipants, {
    fields: [researchDataCollection.participantId],
    references: [researchParticipants.id],
  }),
}));

export const researchAnalyticsRelations = relations(researchAnalytics, ({ one }) => ({
  project: one(researchProjects, {
    fields: [researchAnalytics.projectId],
    references: [researchProjects.id],
  }),
}));

export const researchPapersRelations = relations(researchPapers, ({ one }) => ({
  researcher: one(researcherProfiles, {
    fields: [researchPapers.researcherId],
    references: [researcherProfiles.id],
  }),
}));

// ─── Inferred Types ─────────────────────────────────────────────────────────
export type ResearchProject = typeof researchProjects.$inferSelect;
export type NewResearchProject = typeof researchProjects.$inferInsert;
export type ResearchParticipant = typeof researchParticipants.$inferSelect;
export type NewResearchParticipant = typeof researchParticipants.$inferInsert;
export type ResearchSurvey = typeof researchSurveys.$inferSelect;
export type NewResearchSurvey = typeof researchSurveys.$inferInsert;
export type SurveyQuestion = typeof surveyQuestions.$inferSelect;
export type NewSurveyQuestion = typeof surveyQuestions.$inferInsert;
export type ResearchDataCollectionRecord = typeof researchDataCollection.$inferSelect;
export type NewResearchDataCollectionRecord = typeof researchDataCollection.$inferInsert;
export type ResearchAnalytic = typeof researchAnalytics.$inferSelect;
export type NewResearchAnalytic = typeof researchAnalytics.$inferInsert;
export type ResearchPaper = typeof researchPapers.$inferSelect;
export type NewResearchPaper = typeof researchPapers.$inferInsert;
