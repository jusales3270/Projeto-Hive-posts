import { api } from '../api-client';
import { AddModuleInput } from '../types';

export async function addModule(input: AddModuleInput) {
  const mod = (await api.addModule(input.project_id, {
    title: input.title,
    content: input.content,
    order: input.order,
  })) as any;

  return {
    module_id: mod.id,
    project_id: input.project_id,
    title: mod.title,
    order: mod.order,
    isRecorded: mod.isRecorded,
  };
}
