import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../config/database';
import { uploadFileController } from '../controllers/upload.controller';

const router = Router();
const uploadFile = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

const createDemandSchema = z.object({
  secretariaName: z.string().min(1),
  requesterName: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  publishDate: z.string().datetime().nullable().optional(),
  briefingFileUrl: z.string().nullable().optional(),
  driveLink: z.string().nullable().optional(),
});

router.post('/demandas', async (req: Request, res: Response) => {
  try {
    const data = createDemandSchema.parse(req.body);

    // Find the default owner/admin to assign as the creator of this task
    // Prioritize "Admin SeCom" or the first OWNER created
    let admin = await prisma.user.findFirst({
      where: { role: 'OWNER', name: { contains: 'SeCom' } },
      select: { id: true }
    });

    if (!admin) {
      admin = await prisma.user.findFirst({
        where: { role: 'OWNER' },
        orderBy: { createdAt: 'asc' },
        select: { id: true }
      });
    }

    if (!admin) {
      res.status(500).json({ success: false, error: 'Sistema não configurado corretamente (sem admin).' });
      return;
    }

    const taskData = {
      ...data,
      userId: admin.id,
      isSecretariaDemand: true,
      platform: 'OTHER' as any, // Using OTHER as default platform for these
      priority: 'MEDIUM' as any,
      status: 'PENDING' as any,
    };

    if (taskData.publishDate) {
      taskData.publishDate = new Date(taskData.publishDate) as any;
    }

    const task = await prisma.task.create({ data: taskData });

    res.status(201).json({ success: true, data: task });
  } catch (err: any) {
    console.error('[Public Demandas]', err);
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Erro de validação', details: err.errors });
    } else {
      res.status(400).json({ success: false, error: err?.message || 'Falha ao criar demanda' });
    }
  }
});

// Reuse the existing file controller but without auth middleware
router.post('/upload', uploadFile.single('file'), uploadFileController);

export default router;
