import { Context } from 'grammy';
import { api } from '../api-client';

export async function tarefasCommand(ctx: Context) {
  try {
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const params = `from=${now.toISOString()}&to=${weekLater.toISOString()}&limit=20`;
    const result = await api.listTasks(params);

    if (!result.items || result.items.length === 0) {
      await ctx.reply('Nenhuma tarefa programada para os proximos 7 dias.');
      return;
    }

    const priorityEmoji: Record<string, string> = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', URGENT: '🔴' };
    const statusLabel: Record<string, string> = { PENDING: 'Pendente', IN_PROGRESS: 'Em Andamento', COMPLETED: 'Concluido', CANCELLED: 'Cancelado' };
    const platformLabel: Record<string, string> = { YOUTUBE: 'YouTube', INSTAGRAM: 'Instagram', META_ADS: 'Meta Ads', TIKTOK: 'TikTok', OTHER: 'Outro' };

    const list = result.items
      .map((t: any, i: number) => {
        const date = t.recordDate
          ? new Date(t.recordDate).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
          : 'Sem data';
        const emoji = priorityEmoji[t.priority] || '⚪';
        const sponsored = t.isSponsored ? ' 💰' : '';
        const platform = platformLabel[t.platform] || t.platform;
        const status = statusLabel[t.status] || t.status;
        return `${i + 1}. ${emoji} *${t.title}*${sponsored}\n   📱 ${platform} | 📅 ${date}\n   Status: ${status}`;
      })
      .join('\n\n');

    await ctx.reply(`📋 *Tarefas proximos 7 dias* (${result.total}):\n\n${list}`, {
      parse_mode: 'Markdown',
    });
  } catch (err: any) {
    console.error('[Bot] tarefas command failed:', err.message);
    await ctx.reply('Erro ao listar tarefas. Verifique se a API esta rodando.');
  }
}
