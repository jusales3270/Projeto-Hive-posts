import { api } from '../api-client';
import { DeleteTaskInput } from '../types';

export async function deleteTask(input: DeleteTaskInput) {
  await api.deleteTask(input.task_id);
  return { deleted: true, task_id: input.task_id };
}
