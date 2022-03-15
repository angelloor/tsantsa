import { user } from 'app/modules/core/user/user.data';
import { course } from '../course/course.data';
import { Enrollment } from './enrollment.types';

export const enrollments: Enrollment[] = [];
export const enrollment: Enrollment = {
  id_enrollment: '',
  course: course,
  user: user,
  date_enrollment: '',
  status_enrollment: false,
  completed_course: false,
  deleted_enrollment: false,
};
