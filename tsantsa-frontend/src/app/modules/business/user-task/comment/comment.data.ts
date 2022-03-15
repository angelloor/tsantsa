import { user } from 'app/modules/core/user/user.data';
import { userTask } from '../user-task.data';
import { Comment } from './comment.types';

export const comments: Comment[] = [];
export const comment: Comment = {
  id_comment: '',
  user_task: userTask,
  user: user,
  value_comment: '',
  date_comment: '',
  deleted_comment: false,
};
