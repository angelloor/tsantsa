import { User } from 'app/modules/core/user/user.types';
import { UserTask } from '../user-task.types';

export interface Comment {
  id_comment: string;
  user_task: UserTask;
  user: User;
  value_comment: string;
  date_comment: string;
  deleted_comment: boolean;
}
