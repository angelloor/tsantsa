import { user } from 'app/modules/core/user/user.data';
import { course } from '../course.data';
import { ResourceCourse } from './resource-course.types';

export const resourceCourses: ResourceCourse[] = [];
export const resourceCourse: ResourceCourse = {
  id_resource_course: '',
  course: course,
  user: user,
  file_name: '',
  length_mb: '',
  extension: '',
  server_path: '',
  upload_date: '',
};
