import type { Context } from 'hono';
import { z } from 'zod';
import type { AuthVariables } from '../../infra/middleware/auth';
import { ResearchService } from './research.service';
import { logger } from '../../infra/lib/logger';
import { db, researcherProfiles, eq } from '@healer/db';

const CreateProjectSchema = z.object({
  title: z.string().min(1).max(500),
  researchArea: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  protocolNumber: z.string().max(100).optional(),
  status: z.enum(['draft', 'recruiting', 'in_progress', 'data_collection', 'completed']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  targetSampleSize: z.number().int().min(0).optional(),
});

const UpdateProjectSchema = CreateProjectSchema.partial();

/**
 * Resolves the researcherId for the currently authenticated user.
 * Auto-creates the profile and seeds demo data on first access if not yet created.
 */
async function resolveResearcherId(userId: string): Promise<string> {
  const profile = await db.query.researcherProfiles.findFirst({
    where: eq(researcherProfiles.userId, userId),
    columns: { id: true },
  });
  if (profile) return profile.id;
  const res = await ResearchService.toggleResearcherMode(userId);
  return res.researcherId;
}

export const ResearchController = {
  /** POST /api/research/toggle — enable researcher mode */
  async toggleOn(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    try {
      const result = await ResearchService.toggleResearcherMode(user.id);
      return c.json(result, 200);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.toggleOn failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },

  /** DELETE /api/research/toggle — disable researcher mode */
  async toggleOff(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    try {
      const result = await ResearchService.disableResearcherMode(user.id);
      return c.json(result, 200);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.toggleOff failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },

  /** GET /api/research/profile — get researcher profile */
  async getProfile(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    try {
      const profile = await ResearchService.getProfile(user.id);
      return c.json({ profile }, 200);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.getProfile failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },

  /** GET /api/research/dashboard — full dashboard summary */
  async getDashboard(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    try {
      const researcherId = await resolveResearcherId(user.id);
      if (!researcherId) {
        return c.json({ error: 'Forbidden', message: 'Researcher profile not found.' }, 403);
      }
      const summary = await ResearchService.getDashboardSummary(researcherId);
      return c.json(summary, 200);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.getDashboard failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },

  /** GET /api/research/projects — list all projects */
  async getProjects(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    try {
      const researcherId = await resolveResearcherId(user.id);
      if (!researcherId) {
        return c.json({ error: 'Forbidden', message: 'Researcher profile not found.' }, 403);
      }
      const projects = await ResearchService.getProjects(researcherId);
      return c.json({ projects }, 200);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.getProjects failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },

  /** GET /api/research/projects/:id — get single project */
  async getProjectById(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    const projectId = c.req.param('id');
    if (!projectId) {
      return c.json({ error: 'Bad Request', message: 'Project ID is required.' }, 400);
    }
    try {
      const researcherId = await resolveResearcherId(user.id);
      if (!researcherId) {
        return c.json({ error: 'Forbidden', message: 'Researcher profile not found.' }, 403);
      }
      const project = await ResearchService.getProjectById(projectId, researcherId);
      if (!project) {
        return c.json({ error: 'Not Found', message: 'Project not found.' }, 404);
      }
      return c.json({ project }, 200);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.getProjectById failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },

  /** POST /api/research/projects — create project */
  async createProject(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    const rawBody = await c.req.json().catch(() => null);
    const parsed = CreateProjectSchema.safeParse(rawBody);
    if (!parsed.success) {
      return c.json({ error: 'Bad Request', message: parsed.error.flatten().fieldErrors }, 400);
    }
    try {
      const researcherId = await resolveResearcherId(user.id);
      if (!researcherId) {
        return c.json({ error: 'Forbidden', message: 'Researcher profile not found.' }, 403);
      }
      const project = await ResearchService.createProject(researcherId, parsed.data);
      return c.json({ project }, 201);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.createProject failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },

  /** PATCH /api/research/projects/:id — update project */
  async updateProject(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    const projectId = c.req.param('id');
    if (!projectId) {
      return c.json({ error: 'Bad Request', message: 'Project ID is required.' }, 400);
    }
    const rawBody = await c.req.json().catch(() => null);
    const parsed = UpdateProjectSchema.safeParse(rawBody);
    if (!parsed.success) {
      return c.json({ error: 'Bad Request', message: parsed.error.flatten().fieldErrors }, 400);
    }
    try {
      const researcherId = await resolveResearcherId(user.id);
      if (!researcherId) {
        return c.json({ error: 'Forbidden', message: 'Researcher profile not found.' }, 403);
      }
      const updated = await ResearchService.updateProject(projectId, researcherId, parsed.data);
      if (!updated) {
        return c.json({ error: 'Not Found', message: 'Project not found or access denied.' }, 404);
      }
      return c.json({ project: updated }, 200);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.updateProject failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },

  /** GET /api/research/participants — all participants across projects */
  async getAllParticipants(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    try {
      const researcherId = await resolveResearcherId(user.id);
      if (!researcherId) {
        return c.json({ error: 'Forbidden', message: 'Researcher profile not found.' }, 403);
      }
      const participants = await ResearchService.getAllParticipants(researcherId);
      return c.json({ participants }, 200);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.getAllParticipants failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },

  /** GET /api/research/surveys — all surveys across projects */
  async getAllSurveys(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    try {
      const researcherId = await resolveResearcherId(user.id);
      if (!researcherId) {
        return c.json({ error: 'Forbidden', message: 'Researcher profile not found.' }, 403);
      }
      const surveys = await ResearchService.getAllSurveys(researcherId);
      return c.json({ surveys }, 200);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.getAllSurveys failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },

  /** GET /api/research/analytics — all analytics across projects */
  async getAllAnalytics(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    try {
      const researcherId = await resolveResearcherId(user.id);
      if (!researcherId) {
        return c.json({ error: 'Forbidden', message: 'Researcher profile not found.' }, 403);
      }
      const analytics = await ResearchService.getAllAnalytics(researcherId);
      return c.json({ analytics }, 200);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.getAllAnalytics failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },

  /** GET /api/research/papers — all research papers */
  async getPapers(c: Context<{ Variables: AuthVariables }>) {
    const user = c.get('user');
    try {
      const researcherId = await resolveResearcherId(user.id);
      if (!researcherId) {
        return c.json({ error: 'Forbidden', message: 'Researcher profile not found.' }, 403);
      }
      const papers = await ResearchService.getPapers(researcherId);
      return c.json({ papers }, 200);
    } catch (err: unknown) {
      logger.error({ err }, 'ResearchController.getPapers failed');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return c.json({ error: 'Internal Server Error', message }, 500);
    }
  },
};
