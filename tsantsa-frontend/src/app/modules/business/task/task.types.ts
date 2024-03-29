import { User } from 'app/modules/core/user/user.types';
import { Course } from '../course/course.types';
import { Partial } from '../period/quimester/partial/partial.types';

export interface Task {
  dependency: string;
  enrollment: string;
  id_task: string;
  course: Course;
  user: User;
  partial: Partial;
  name_task: string;
  description_task: string;
  status_task: boolean;
  creation_date_task: string;
  limit_date: string;
  deleted_task: boolean;
}
