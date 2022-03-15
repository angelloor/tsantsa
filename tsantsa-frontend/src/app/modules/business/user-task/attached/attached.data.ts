import { userTask } from '../user-task.data';
import { Attached } from './attached.types';

export const attacheds: Attached[] = [];
export const attached: Attached = {
  id_attached: '',
  user_task: userTask,
  file_name: '',
  length_mb: '',
  extension: '',
  server_path: '',
  upload_date: '',
};
