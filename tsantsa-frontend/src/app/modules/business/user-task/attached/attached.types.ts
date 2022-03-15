import { UserTask } from '../user-task.types';

export interface Attached {
  id_attached: string;
  user_task: UserTask;
  file_name: string;
  length_mb: string;
  extension: string;
  server_path: string;
  upload_date: string;
}
