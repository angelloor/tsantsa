import { user } from 'app/modules/core/user/user.data';
import { course } from '../course.data';
import { Forum } from './forum.types';

export const forums: Forum[] = [];
export const forum: Forum = {
  id_forum: '',
  course: course,
  user: user,
  title_forum: '',
  description_forum: '',
  date_forum: '',
  deleted_forum: false,
};
