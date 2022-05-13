import { user } from 'app/modules/core/user/user.data';
import { forum } from '../forum.data';
import { CommentForum } from './comment-forum.types';

export const commentForums: CommentForum[] = [];
export const commentForum: CommentForum = {
  id_comment_forum: '',
  forum: forum,
  user: user,
  value_comment_forum: '',
  date_comment_forum: '',
  deleted_comment_forum: false,
};
