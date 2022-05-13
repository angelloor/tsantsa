import { User } from 'app/modules/core/user/user.types';
import { Forum } from '../forum.types';

export interface CommentForum {
  id_comment_forum: string;
  forum: Forum;
  user: User;
  value_comment_forum: string;
  date_comment_forum: string;
  deleted_comment_forum: boolean;
}
