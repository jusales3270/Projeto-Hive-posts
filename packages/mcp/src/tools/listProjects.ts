import { api } from '../api-client';
import { ListProjectsInput } from '../types';

export async function listProjects(input: ListProjectsInput) {
  const params: Record<string, string> = {};
  if (input.status) params.status = input.status;
  if (input.limit) params.limit = String(input.limit);
  if (input.offset) params.page = String(Math.floor(input.offset / (input.limit || 20)) + 1);

  const result = await api.listProjects(params);
  return { projects: result.items, total: result.total };
}
