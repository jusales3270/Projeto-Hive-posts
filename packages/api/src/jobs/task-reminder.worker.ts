import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { prisma } from '../config/database';

export const taskReminderWorker = new Worker(
  'task-reminder-queue',
  async (job) => {
    const { taskId } = job.data;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.status === 'COMPLETED' || task.status === 'CANCELLED') return;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIds = (process.env.TELEGRAM_ALLOWED_CHAT_IDS || '').split(',').filter(Boolean);

    if (!botToken || chatIds.length === 0) {
      console.warn('[TaskReminder] No bot token or chat IDs configured');
      return;
    }

    const dateStr = task.recordDate
      ? new Date(task.recordDate).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : 'Nao definida';

    const platformLabel: Record<string, string> = {
      YOUTUBE: 'YouTube',
      INSTAGRAM: 'Instagram',
      META_ADS: 'Meta Ads',
      TIKTOK: 'TikTok',
      OTHER: 'Outro',
    };

    const priorityEmoji: Record<string, string> = {
      LOW: '🟢',
      MEDIUM: '🟡',
      HIGH: '🟠',
      URGENT: '🔴',
    };

    const sponsored = task.isSponsored ? `\n💰 Patrocinado: ${task.sponsorName || 'Sim'}` : '';
    const message = `⏰ *Lembrete de Gravacao*\n\n📹 *${task.title}*\n📅 Data: ${dateStr}\n📱 Plataforma: ${platformLabel[task.platform] || task.platform}\n${priorityEmoji[task.priority] || '⚪'} Prioridade: ${task.priority}${sponsored}`;

    for (const chatId of chatIds) {
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId.trim(),
            text: message,
            parse_mode: 'Markdown',
          }),
        });
      } catch (err) {
        console.error(`[TaskReminder] Failed to send to chat ${chatId}:`, err);
      }
    }
  },
  {
    connection: redis,
    limiter: { max: 10, duration: 60000 },
  },
);
