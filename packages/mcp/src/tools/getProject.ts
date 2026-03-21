import { api } from '../api-client';
import { GetProjectInput } from '../types';

export async function getProject(input: GetProjectInput) {
  const project = await api.getProject(input.project_id);
  return project;
}
