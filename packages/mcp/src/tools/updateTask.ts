import { api } from '../api-client';
import { UpdateTaskInput } from '../types';

export async function updateTask(input: UpdateTaskInput) {
  const { task_id, ...body } = input;
  const task = (await api.updateTask(task_id, body)) as any;

  return {
    task_id: task.id,
    title: task.title,
    platform: task.platform,
    status: task.status,
    priority: task.priority,
    recordDate: task.recordDate,
    publishDate: task.publishDate,
    isSponsored: task.isSponsored,
  };
}
