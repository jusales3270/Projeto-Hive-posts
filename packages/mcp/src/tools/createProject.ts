import { api } from '../api-client';
import { CreateProjectInput } from '../types';

export async function createProject(input: CreateProjectInput) {
  const project = (await api.createProject({
    title: input.title,
    description: input.description,
    modules: input.modules?.map((m, idx) => ({
      title: m.title,
      content: m.content,
      order: idx,
    })),
  })) as any;

  return {
    project_id: project.id,
    title: project.title,
    status: project.status,
    modules_count: project.modules?.length || 0,
  };
}
