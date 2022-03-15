import { User } from 'app/modules/core/user/user.types';
import { Course } from '../course/course.types';

export interface Enrollment {
  id_enrollment: string;
  course: Course;
  user: User;
  date_enrollment: string;
  status_enrollment: boolean;
  completed_course: boolean;
  deleted_enrollment: boolean;
}
