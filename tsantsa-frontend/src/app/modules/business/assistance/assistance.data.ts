import { user } from 'app/modules/core/user/user.data';
import { course } from '../course/course.data';
import { Assistance } from './assistance.types';

export const assistances: Assistance[] = [];
export const assistance: Assistance = {
  id_assistance: '',
  user: user,
  course: course,
  start_marking_date: '',
  end_marking_date: '',
  is_late: false,
};
