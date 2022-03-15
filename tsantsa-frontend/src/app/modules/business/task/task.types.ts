import { Course } from '../course/course.types';

export interface Task {
  id_task: string;
  course: Course;
  name_task: string;
  description_task: string;
  status_task: boolean;
  creation_date_task: string;
  limit_date: string;
  deleted_task: boolean;
}
