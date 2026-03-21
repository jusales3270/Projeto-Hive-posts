import { api } from '../api-client';
import { UpdateProjectInput } from '../types';

export async function updateProject(input: UpdateProjectInput) {
  const { project_id, ...body } = input;
  const project = (await api.updateProject(project_id, body)) as any;

  return {
    project_id: project.id,
    title: project.title,
    status: project.status,
  };
}
