import { api } from '../api-client';
import { UpdateModuleInput } from '../types';

export async function updateModule(input: UpdateModuleInput) {
  const { project_id, module_id, ...body } = input;
  const mod = (await api.updateModule(project_id, module_id, body)) as any;

  return {
    module_id: mod.id,
    project_id,
    title: mod.title,
    isRecorded: mod.isRecorded,
    driveLink: mod.driveLink,
  };
}
