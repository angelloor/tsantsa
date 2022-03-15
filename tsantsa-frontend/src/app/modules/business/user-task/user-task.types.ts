import { User } from 'app/modules/core/user/user.types';
import { Task } from '../task/task.types';

export interface UserTask {
  id_user_task: string;
  user: User;
  task: Task;
  response_user_task: string;
  shipping_date_user_task: string;
  qualification_user_task: number;
  is_open: boolean;
  is_dispatched: boolean;
  is_qualified: boolean;
}
