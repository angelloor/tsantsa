import { course } from '../course/course.data';
import { Task } from './task.types';

export const tasks: Task[] = [];
export const task: Task = {
  id_task: '',
  course: course,
  name_task: '',
  description_task: '',
  status_task: false,
  creation_date_task: '',
  limit_date: '',
  deleted_task: false,
};
