import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createProject, listProjects, getProject, updateProject, deleteProject,
  addModule, updateModule, deleteModule, reorderModules,
} from '../controllers/project.controller';

const router = Router();

const moduleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  modules: z.array(moduleSchema).optional(),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
});

const addModuleSchema = moduleSchema;

const updateModuleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  isRecorded: z.boolean().optional(),
  driveLink: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
});

const reorderSchema = z.object({
  moduleIds: z.array(z.string().uuid()),
});

router.use(authMiddleware);

router.post('/', validate(createProjectSchema), createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/modules', validate(addModuleSchema), addModule);
router.put('/:id/modules/:moduleId', validate(updateModuleSchema), updateModule);
router.delete('/:id/modules/:moduleId', deleteModule);
router.put('/:id/modules-order', validate(reorderSchema), reorderModules);

export default router;
