import { api } from '../api-client';
import { DeleteProjectInput } from '../types';

export async function deleteProject(input: DeleteProjectInput) {
  await api.deleteProject(input.project_id);
  return { deleted: true, project_id: input.project_id };
}
