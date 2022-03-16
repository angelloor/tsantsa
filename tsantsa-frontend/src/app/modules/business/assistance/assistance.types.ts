import { User } from 'app/modules/core/user/user.types';
import { Course } from '../course/course.types';

export interface Assistance {
  id_assistance: string;
  user: User;
  course: Course;
  start_marking_date: string;
  end_marking_date: string;
  is_late: boolean;
}
