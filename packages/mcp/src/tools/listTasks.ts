import { api } from '../api-client';
import { ListTasksInput } from '../types';

export async function listTasks(input: ListTasksInput) {
  const params: Record<string, string> = {};
  if (input.status) params.status = input.status;
  if (input.priority) params.priority = input.priority;
  if (input.platform) params.platform = input.platform;
  if (input.projectId) params.projectId = input.projectId;
  if (input.from) params.from = input.from;
  if (input.to) params.to = input.to;
  if (input.limit) params.limit = String(input.limit);
  if (input.offset) params.page = String(Math.floor(input.offset / (input.limit || 20)) + 1);

  const result = await api.listTasks(params);
  return { tasks: result.items, total: result.total };
}
