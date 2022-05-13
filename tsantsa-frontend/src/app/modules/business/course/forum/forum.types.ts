import { User } from 'app/modules/core/user/user.types';
import { Course } from '../course.types';

export interface Forum {
  id_forum: string;
  course: Course;
  user: User;
  title_forum: string;
  description_forum: string;
  date_forum: string;
  deleted_forum: boolean;
}
