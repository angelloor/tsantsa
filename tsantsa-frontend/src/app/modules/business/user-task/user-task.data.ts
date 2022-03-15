import { user } from 'app/modules/core/user/user.data';
import { task } from '../task/task.data';
import { UserTask } from './user-task.types';

export const userTasks: UserTask[] = [];
export const userTask: UserTask = {
  id_user_task: '',
  user: user,
  task: task,
  response_user_task: '',
  shipping_date_user_task: '',
  qualification_user_task: 1,
  is_open: false,
  is_dispatched: false,
  is_qualified: false,
};
