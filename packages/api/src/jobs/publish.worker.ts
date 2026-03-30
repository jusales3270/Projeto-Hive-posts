import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { publishToInstagram } from '../services/instagram.service';

export const publishWorker = new Worker(
  'publish-queue',
  async (job) => {
    const { postId, accountId } = job.data;

    await prisma.post.update({
      where: { id: postId },
      data: { status: 'PUBLISHING' },
    });

    try {
      const result = await publishToInstagram(postId, accountId);
      await prisma.post.update({
        where: { id: postId },
        data: { status: 'PUBLISHED', publishedAt: new Date(), instagramId: result.id },
      });
    } catch (error) {
      await prisma.post.update({
        where: { id: postId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  },
  {
    connection: redis,
    limiter: { max: 10, duration: 60000 },
  },
);
