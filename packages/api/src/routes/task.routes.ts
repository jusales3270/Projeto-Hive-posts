import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createTask, listTasks, getTask, updateTask, deleteTask } from '../controllers/task.controller';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullable().optional(),
  platform: z.enum(['YOUTUBE', 'INSTAGRAM', 'META_ADS', 'TIKTOK', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  recordDate: z.string().datetime().nullable().optional(),
  publishDate: z.string().datetime().nullable().optional(),
  script: z.string().nullable().optional(),
  driveLink: z.string().nullable().optional(),
  isSponsored: z.boolean().optional(),
  sponsorName: z.string().max(200).nullable().optional(),
  sponsorBriefing: z.string().nullable().optional(),
  sponsorContact: z.string().max(200).nullable().optional(),
  sponsorDeadline: z.string().datetime().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  scriptFileUrl: z.string().nullable().optional(),
  briefingFileUrl: z.string().nullable().optional(),
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
