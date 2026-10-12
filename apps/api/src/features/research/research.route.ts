import { Hono } from 'hono';
import { requireAuth, requireActiveAccount } from '../../infra/middleware';
import { ResearchController } from './research.controller';

const researchRouter = new Hono();

researchRouter.use('*', requireAuth, requireActiveAccount);

// Researcher mode activation
researchRouter.post('/toggle', ResearchController.toggleOn);
researchRouter.delete('/toggle', ResearchController.toggleOff);

// Researcher profile
researchRouter.get('/profile', ResearchController.getProfile);

// Dashboard summary
researchRouter.get('/dashboard', ResearchController.getDashboard);

// Projects CRUD
researchRouter.get('/projects', ResearchController.getProjects);
researchRouter.post('/projects', ResearchController.createProject);
researchRouter.get('/projects/:id', ResearchController.getProjectById);
researchRouter.patch('/projects/:id', ResearchController.updateProject);

// Cross-project aggregations
researchRouter.get('/participants', ResearchController.getAllParticipants);
researchRouter.get('/surveys', ResearchController.getAllSurveys);
researchRouter.get('/analytics', ResearchController.getAllAnalytics);
researchRouter.get('/papers', ResearchController.getPapers);

export { researchRouter };
