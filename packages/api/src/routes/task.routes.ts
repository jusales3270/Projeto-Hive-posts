import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createTask, listTasks, getTask, updateTask, deleteTask } from '../controllers/task.controller';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  platform: z.enum(['YOUTUBE', 'INSTAGRAM', 'META_ADS', 'TIKTOK', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  recordDate: z.string().datetime().optional(),
  publishDate: z.string().datetime().optional(),
  script: z.string().optional(),
  driveLink: z.string().optional(),
  isSponsored: z.boolean().optional(),
  sponsorName: z.string().max(200).optional(),
  sponsorBriefing: z.string().optional(),
  sponsorContact: z.string().max(200).optional(),
  sponsorDeadline: z.string().datetime().optional(),
  projectId: z.string().uuid().optional(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

router.use(authMiddleware);

router.post('/', validate(createTaskSchema), createTask);
router.get('/', listTasks);
router.get('/:id', getTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
