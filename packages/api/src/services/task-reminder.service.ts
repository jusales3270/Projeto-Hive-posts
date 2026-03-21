import { Queue } from 'bullmq';
import { redis } from '../config/redis';

const taskReminderQueue = new Queue('task-reminder-queue', { connection: redis });

export async function scheduleTaskReminder(taskId: string, recordDate: Date) {
  const reminderTime = recordDate.getTime() - 24 * 60 * 60 * 1000;
  const delay = reminderTime - Date.now();
  if (delay < 0) return;

  await taskReminderQueue.add(
    'remind',
    { taskId },
    { delay, jobId: `task-remind-${taskId}` },
  );
}

export async function cancelTaskReminder(taskId: string) {
  const job = await taskReminderQueue.getJob(`task-remind-${taskId}`);
  if (job) await job.remove();
}

export { taskReminderQueue };
