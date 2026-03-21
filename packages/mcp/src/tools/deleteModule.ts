import { api } from '../api-client';
import { DeleteModuleInput } from '../types';

export async function deleteModule(input: DeleteModuleInput) {
  await api.deleteModule(input.project_id, input.module_id);
  return { deleted: true, project_id: input.project_id, module_id: input.module_id };
}
