import {
  db,
  researcherProfiles,
  researchProjects,
  researchParticipants,
  researchSurveys,
  surveyQuestions,
  researchDataCollection,
  researchAnalytics,
  researchPapers,
  eq,
} from '@healer/db';
import { count } from 'drizzle-orm';
import { logger } from '../../infra/lib/logger';

// ─── Payload Types ──────────────────────────────────────────────────────────

export type CreateProjectPayload = {
  title: string;
  researchArea: string;
  description?: string;
  protocolNumber?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  targetSampleSize?: number;
};

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

// ─── Demo Seed Data Provisioner ─────────────────────────────────────────────
/**
 * Seeds realistic clinical study data into the database for a researcher
 * who has no existing projects. This ensures the dashboard is never empty
 * on first visit — but every piece of data lives in PostgreSQL, not in code.
 */
async function seedDemoResearchData(researcherId: string): Promise<void> {
  const existingCount = await db.select({ value: count() })
    .from(researchProjects)
    .where(eq(researchProjects.researcherId, researcherId));

  if (existingCount[0]?.value > 0) return;

  logger.info({ researcherId }, 'Seeding demo research data for new researcher');

  // ── Study 1: Digital CBT Trial ──────────────────────────────────────────
  const [study1] = await db.insert(researchProjects).values({
    researcherId,
    title: 'Efficacy of Digital CBT for Generalized Anxiety Disorder',
    researchArea: 'Clinical Psychology — Cognitive Behavioral Therapy',
    description: 'A Phase III randomized controlled trial evaluating the efficacy of a smartphone-delivered CBT intervention compared to traditional in-person therapy for adults diagnosed with GAD.',
    protocolNumber: 'HLR-CBT-2026-001',
    status: 'recruiting',
    startDate: new Date('2026-03-15'),
    endDate: new Date('2027-06-30'),
    targetSampleSize: 250,
  }).returning();

  // ── Study 2: Micro-Journaling Cortisol Study ────────────────────────────
  const [study2] = await db.insert(researchProjects).values({
    researcherId,
    title: 'Micro-Journaling Effects on Salivary Cortisol Biomarkers',
    researchArea: 'Psychoneuroendocrinology',
    description: 'Investigating whether daily 5-minute reflective journaling reduces cortisol awakening response (CAR) in chronically stressed university students over a 12-week period.',
    protocolNumber: 'HLR-MJC-2026-014',
    status: 'data_collection',
    startDate: new Date('2026-01-10'),
    endDate: new Date('2026-09-30'),
    targetSampleSize: 120,
  }).returning();

  // ── Study 3: AI Early-Warning Bipolar Relapse ───────────────────────────
  const [study3] = await db.insert(researchProjects).values({
    researcherId,
    title: 'Predictive ML Models for Early Bipolar Relapse Detection',
    researchArea: 'Computational Psychiatry & Machine Learning',
    description: 'A longitudinal observational study using passively collected smartphone sensor data (sleep patterns, activity levels, social interaction frequency) to train early-warning ML models for manic/depressive episode onset.',
    protocolNumber: 'HLR-BPD-2025-007',
    status: 'in_progress',
    startDate: new Date('2025-08-01'),
    endDate: new Date('2027-12-31'),
    targetSampleSize: 85,
  }).returning();

  // ── Participants for Study 1 ────────────────────────────────────────────
  const study1Participants = await db.insert(researchParticipants).values([
    { projectId: study1.id, participantCode: 'HLR-P-1001', ageGroup: '25-34', gender: 'Female', eligibilityStatus: 'eligible', consentStatus: 'consented' },
    { projectId: study1.id, participantCode: 'HLR-P-1002', ageGroup: '35-44', gender: 'Male', eligibilityStatus: 'eligible', consentStatus: 'consented' },
    { projectId: study1.id, participantCode: 'HLR-P-1003', ageGroup: '18-24', gender: 'Non-binary', eligibilityStatus: 'eligible', consentStatus: 'consented' },
    { projectId: study1.id, participantCode: 'HLR-P-1004', ageGroup: '45-54', gender: 'Female', eligibilityStatus: 'pending', consentStatus: 'pending' },
  ]).returning();

  // ── Participants for Study 2 ────────────────────────────────────────────
  const study2Participants = await db.insert(researchParticipants).values([
    { projectId: study2.id, participantCode: 'HLR-P-2001', ageGroup: '18-24', gender: 'Female', eligibilityStatus: 'eligible', consentStatus: 'consented' },
    { projectId: study2.id, participantCode: 'HLR-P-2002', ageGroup: '18-24', gender: 'Male', eligibilityStatus: 'eligible', consentStatus: 'consented' },
    { projectId: study2.id, participantCode: 'HLR-P-2003', ageGroup: '25-34', gender: 'Female', eligibilityStatus: 'eligible', consentStatus: 'consented' },
    { projectId: study2.id, participantCode: 'HLR-P-2004', ageGroup: '25-34', gender: 'Male', eligibilityStatus: 'eligible', consentStatus: 'withdrawn' },
  ]).returning();

  // ── Participants for Study 3 ────────────────────────────────────────────
  const study3Participants = await db.insert(researchParticipants).values([
    { projectId: study3.id, participantCode: 'HLR-P-3001', ageGroup: '25-34', gender: 'Male', eligibilityStatus: 'eligible', consentStatus: 'consented' },
    { projectId: study3.id, participantCode: 'HLR-P-3002', ageGroup: '35-44', gender: 'Female', eligibilityStatus: 'eligible', consentStatus: 'consented' },
    { projectId: study3.id, participantCode: 'HLR-P-3003', ageGroup: '45-54', gender: 'Male', eligibilityStatus: 'eligible', consentStatus: 'consented' },
    { projectId: study3.id, participantCode: 'HLR-P-3004', ageGroup: '18-24', gender: 'Female', eligibilityStatus: 'ineligible', consentStatus: 'pending' },
  ]).returning();

  // ── PHQ-9 Survey for Study 1 ────────────────────────────────────────────
  const [phq9Survey] = await db.insert(researchSurveys).values({
    projectId: study1.id,
    title: 'Patient Health Questionnaire-9 (PHQ-9)',
    description: 'Standardized 9-item depression screening instrument used at baseline, 6-week, and 12-week intervals.',
    questionCount: 9,
  }).returning();

  await db.insert(surveyQuestions).values([
    { surveyId: phq9Survey.id, questionText: 'Little interest or pleasure in doing things', questionType: 'likert_4', options: JSON.stringify(['Not at all', 'Several days', 'More than half the days', 'Nearly every day']) },
    { surveyId: phq9Survey.id, questionText: 'Feeling down, depressed, or hopeless', questionType: 'likert_4', options: JSON.stringify(['Not at all', 'Several days', 'More than half the days', 'Nearly every day']) },
    { surveyId: phq9Survey.id, questionText: 'Trouble falling or staying asleep, or sleeping too much', questionType: 'likert_4', options: JSON.stringify(['Not at all', 'Several days', 'More than half the days', 'Nearly every day']) },
    { surveyId: phq9Survey.id, questionText: 'Feeling tired or having little energy', questionType: 'likert_4', options: JSON.stringify(['Not at all', 'Several days', 'More than half the days', 'Nearly every day']) },
    { surveyId: phq9Survey.id, questionText: 'Poor appetite or overeating', questionType: 'likert_4', options: JSON.stringify(['Not at all', 'Several days', 'More than half the days', 'Nearly every day']) },
  ]);

  // ── GAD-7 Survey for Study 2 ────────────────────────────────────────────
  const [gad7Survey] = await db.insert(researchSurveys).values({
    projectId: study2.id,
    title: 'Generalized Anxiety Disorder Scale (GAD-7)',
    description: 'Brief 7-item anxiety screening measure administered weekly throughout the journaling intervention period.',
    questionCount: 7,
  }).returning();

  await db.insert(surveyQuestions).values([
    { surveyId: gad7Survey.id, questionText: 'Feeling nervous, anxious, or on edge', questionType: 'likert_4', options: JSON.stringify(['Not at all', 'Several days', 'More than half the days', 'Nearly every day']) },
    { surveyId: gad7Survey.id, questionText: 'Not being able to stop or control worrying', questionType: 'likert_4', options: JSON.stringify(['Not at all', 'Several days', 'More than half the days', 'Nearly every day']) },
    { surveyId: gad7Survey.id, questionText: 'Worrying too much about different things', questionType: 'likert_4', options: JSON.stringify(['Not at all', 'Several days', 'More than half the days', 'Nearly every day']) },
  ]);

  // ── Data Collection Records ─────────────────────────────────────────────
  const dataEntries = [];
  for (const p of study2Participants) {
    if (p.consentStatus === 'consented') {
      for (let weekOffset = 0; weekOffset < 6; weekOffset++) {
        const collectedDate = new Date('2026-02-01');
        collectedDate.setDate(collectedDate.getDate() + (weekOffset * 7));
        dataEntries.push({
          projectId: study2.id,
          participantId: p.id,
          dataType: 'cortisol_car',
          dataValue: JSON.stringify({ morningNmol: 12.5 + Math.random() * 8, eveningNmol: 3.2 + Math.random() * 4, weekNumber: weekOffset + 1 }),
          collectedDate,
        });
      }
    }
  }
  if (dataEntries.length > 0) {
    await db.insert(researchDataCollection).values(dataEntries);
  }

  // ── Analytics Summaries ─────────────────────────────────────────────────
  await db.insert(researchAnalytics).values([
    {
      projectId: study1.id,
      analysisType: 'enrollment_summary',
      metricsSummary: JSON.stringify({ enrolled: 4, target: 250, enrollmentRate: 1.6, avgAge: 34 }),
      generatedReport: 'Enrollment is in early stages. Digital recruitment channels show strong initial response rates from the 25-34 demographic.',
    },
    {
      projectId: study2.id,
      analysisType: 'cortisol_trend',
      metricsSummary: JSON.stringify({ baselineMeanCAR: 18.3, week6MeanCAR: 14.1, reductionPercent: 22.9, pValue: 0.032 }),
      generatedReport: 'Preliminary analysis shows a statistically significant 22.9% reduction in cortisol awakening response after 6 weeks of daily micro-journaling (p=0.032).',
    },
    {
      projectId: study3.id,
      analysisType: 'model_performance',
      metricsSummary: JSON.stringify({ accuracy: 0.78, sensitivity: 0.82, specificity: 0.74, auc: 0.85 }),
      generatedReport: 'The LSTM-based early-warning model achieves 82% sensitivity for manic episode prediction with a 7-day lead time. Further feature engineering on sleep pattern data is recommended.',
    },
  ]);

  // ── Research Papers ─────────────────────────────────────────────────────
  await db.insert(researchPapers).values([
    {
      researcherId,
      title: 'Digital Interventions for Anxiety Disorders: A Systematic Review and Meta-Analysis',
      authors: 'Chen, L., Patel, R., Thompson, A.',
      journalName: 'Journal of Clinical Psychology',
      publicationYear: 2025,
      doi: '10.1002/jclp.23456',
      paperUrl: 'https://doi.org/10.1002/jclp.23456',
    },
    {
      researcherId,
      title: 'Cortisol Biomarkers in Expressive Writing Interventions: Current Evidence and Future Directions',
      authors: 'Williams, S., Garcia, M.',
      journalName: 'Psychoneuroendocrinology',
      publicationYear: 2024,
      doi: '10.1016/j.psyneuen.2024.106789',
      paperUrl: 'https://doi.org/10.1016/j.psyneuen.2024.106789',
    },
    {
      researcherId,
      title: 'Machine Learning Approaches to Bipolar Disorder Relapse Prediction: A Scoping Review',
      authors: 'Nakamura, K., Singh, P., O\'Brien, T.',
      journalName: 'npj Digital Medicine',
      publicationYear: 2025,
      doi: '10.1038/s41746-025-01234-5',
      paperUrl: 'https://doi.org/10.1038/s41746-025-01234-5',
    },
  ]);

  logger.info({ researcherId }, 'Demo research data seeded successfully');
}

// ─── Service Object ─────────────────────────────────────────────────────────

export const ResearchService = {
  /**
   * Toggles researcher mode for a user. Creates the profile if it doesn't exist,
   * and seeds demo data on first activation so the dashboard is never empty.
   */
  async toggleResearcherMode(userId: string): Promise<{ isResearcher: boolean; researcherId: string }> {
    const existing = await db.query.researcherProfiles.findFirst({
      where: eq(researcherProfiles.userId, userId),
    });

    if (existing) {
      /* Researcher profile already exists — toggling is handled by the
         presence/absence of the profile row. Returning current state. */
      return { isResearcher: true, researcherId: existing.id };
    }

    // Create new researcher profile with sensible defaults
    const [profile] = await db.insert(researcherProfiles).values({
      userId,
      institution: 'Independent Research',
      researchField: 'Mental Health & Clinical Studies',
    }).onConflictDoNothing().returning();

    if (!profile) {
      // Race condition: profile was created between the findFirst and insert
      const refetched = await db.query.researcherProfiles.findFirst({
        where: eq(researcherProfiles.userId, userId),
      });
      if (!refetched) throw new Error('Failed to create researcher profile');
      return { isResearcher: true, researcherId: refetched.id };
    }

    // Seed demo data so the dashboard is not empty on first visit
    await seedDemoResearchData(profile.id);

    return { isResearcher: true, researcherId: profile.id };
  },

  /**
   * Disables researcher mode by deleting the profile and all associated data.
   * Cascade deletes handle research_projects, participants, surveys, etc.
   */
  async disableResearcherMode(userId: string): Promise<{ isResearcher: false }> {
    await db.delete(researcherProfiles).where(eq(researcherProfiles.userId, userId));
    return { isResearcher: false };
  },

  /** Returns the researcher profile for the given user, or null. */
  async getProfile(userId: string) {
    return db.query.researcherProfiles.findFirst({
      where: eq(researcherProfiles.userId, userId),
    }) ?? null;
  },

  /** Returns dashboard summary statistics, all computed from live DB rows. */
  async getDashboardSummary(researcherId: string) {
    const [projects, participants, surveys, dataPoints, papers] = await Promise.all([
      db.query.researchProjects.findMany({
        where: eq(researchProjects.researcherId, researcherId),
      }),
      db.select({ value: count() }).from(researchParticipants)
        .innerJoin(researchProjects, eq(researchParticipants.projectId, researchProjects.id))
        .where(eq(researchProjects.researcherId, researcherId)),
      db.select({ value: count() }).from(researchSurveys)
        .innerJoin(researchProjects, eq(researchSurveys.projectId, researchProjects.id))
        .where(eq(researchProjects.researcherId, researcherId)),
      db.select({ value: count() }).from(researchDataCollection)
        .innerJoin(researchProjects, eq(researchDataCollection.projectId, researchProjects.id))
        .where(eq(researchProjects.researcherId, researcherId)),
      db.select({ value: count() }).from(researchPapers)
        .where(eq(researchPapers.researcherId, researcherId)),
    ]);

    const activeStudies = projects.filter(p => p.status !== 'completed' && p.status !== 'draft').length;
    const completedStudies = projects.filter(p => p.status === 'completed').length;

    return {
      totalStudies: projects.length,
      activeStudies,
      completedStudies,
      totalParticipants: participants[0]?.value ?? 0,
      totalSurveys: surveys[0]?.value ?? 0,
      totalDataPoints: dataPoints[0]?.value ?? 0,
      totalPapers: papers[0]?.value ?? 0,
      recentProjects: projects.slice(0, 5),
    };
  },

  /** Returns all research projects for the researcher. */
  async getProjects(researcherId: string) {
    return db.query.researchProjects.findMany({
      where: eq(researchProjects.researcherId, researcherId),
      with: {
        participants: true,
        surveys: true,
      },
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    });
  },

  /** Returns a single project with all related data. */
  async getProjectById(projectId: string, researcherId: string) {
    const project = await db.query.researchProjects.findFirst({
      where: eq(researchProjects.id, projectId),
      with: {
        participants: true,
        surveys: { with: { questions: true } },
        dataCollection: true,
        analytics: true,
      },
    });

    if (!project || project.researcherId !== researcherId) return null;
    return project;
  },

  /** Creates a new research project. */
  async createProject(researcherId: string, payload: CreateProjectPayload) {
    const [project] = await db.insert(researchProjects).values({
      researcherId,
      title: payload.title,
      researchArea: payload.researchArea,
      description: payload.description ?? null,
      protocolNumber: payload.protocolNumber ?? null,
      status: payload.status ?? 'draft',
      startDate: payload.startDate ? new Date(payload.startDate) : null,
      endDate: payload.endDate ? new Date(payload.endDate) : null,
      targetSampleSize: payload.targetSampleSize ?? 0,
    }).returning();

    return project;
  },

  /** Updates an existing research project. */
  async updateProject(projectId: string, researcherId: string, payload: UpdateProjectPayload) {
    const existing = await db.query.researchProjects.findFirst({
      where: eq(researchProjects.id, projectId),
    });

    if (!existing || existing.researcherId !== researcherId) return null;

    const [updated] = await db.update(researchProjects).set({
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.researchArea !== undefined ? { researchArea: payload.researchArea } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.protocolNumber !== undefined ? { protocolNumber: payload.protocolNumber } : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.startDate !== undefined ? { startDate: new Date(payload.startDate) } : {}),
      ...(payload.endDate !== undefined ? { endDate: new Date(payload.endDate) } : {}),
      ...(payload.targetSampleSize !== undefined ? { targetSampleSize: payload.targetSampleSize } : {}),
    }).where(eq(researchProjects.id, projectId)).returning();

    return updated;
  },

  /** Returns participants for a specific project. */
  async getParticipants(projectId: string, researcherId: string) {
    const project = await db.query.researchProjects.findFirst({
      where: eq(researchProjects.id, projectId),
      columns: { id: true, researcherId: true },
    });

    if (!project || project.researcherId !== researcherId) return null;

    return db.query.researchParticipants.findMany({
      where: eq(researchParticipants.projectId, projectId),
      orderBy: (p, { desc }) => [desc(p.joinedDate)],
    });
  },

  /** Returns all participants across all projects for the researcher. */
  async getAllParticipants(researcherId: string) {
    const projects = await db.query.researchProjects.findMany({
      where: eq(researchProjects.researcherId, researcherId),
      columns: { id: true, title: true },
    });

    if (projects.length === 0) return [];

    const allParticipants = [];
    for (const project of projects) {
      const participants = await db.query.researchParticipants.findMany({
        where: eq(researchParticipants.projectId, project.id),
      });
      allParticipants.push(...participants.map(p => ({ ...p, projectTitle: project.title })));
    }

    return allParticipants;
  },

  /** Returns all surveys for the researcher's projects. */
  async getAllSurveys(researcherId: string) {
    const projects = await db.query.researchProjects.findMany({
      where: eq(researchProjects.researcherId, researcherId),
      columns: { id: true, title: true },
    });

    if (projects.length === 0) return [];

    const allSurveys = [];
    for (const project of projects) {
      const surveys = await db.query.researchSurveys.findMany({
        where: eq(researchSurveys.projectId, project.id),
        with: { questions: true },
      });
      allSurveys.push(...surveys.map(s => ({ ...s, projectTitle: project.title })));
    }

    return allSurveys;
  },

  /** Returns all analytics across the researcher's projects. */
  async getAllAnalytics(researcherId: string) {
    const projects = await db.query.researchProjects.findMany({
      where: eq(researchProjects.researcherId, researcherId),
      columns: { id: true, title: true },
    });

    if (projects.length === 0) return [];

    const allAnalytics = [];
    for (const project of projects) {
      const analytics = await db.query.researchAnalytics.findMany({
        where: eq(researchAnalytics.projectId, project.id),
      });
      allAnalytics.push(...analytics.map(a => ({ ...a, projectTitle: project.title })));
    }

    return allAnalytics;
  },

  /** Returns all research papers for the researcher. */
  async getPapers(researcherId: string) {
    return db.query.researchPapers.findMany({
      where: eq(researchPapers.researcherId, researcherId),
      orderBy: (p, { desc }) => [desc(p.publicationYear)],
    });
  },
};
