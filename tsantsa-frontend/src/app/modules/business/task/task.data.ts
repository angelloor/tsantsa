import { user } from 'app/modules/core/user/user.data';
import { course } from '../course/course.data';
import { partial } from '../period/quimester/partial/partial.data';
import { Task } from './task.types';

export const tasks: Task[] = [];
export const task: Task = {
  dependency: '0',
  enrollment: '0',
  id_task: '',
  course: course,
  user: user,
  partial: partial,
  name_task: '',
  description_task: '',
  status_task: false,
  creation_date_task: '',
  limit_date: '',
  deleted_task: false,
};
