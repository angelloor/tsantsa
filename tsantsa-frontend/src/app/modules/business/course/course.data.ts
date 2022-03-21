import { company } from 'app/modules/core/company/company.data';
import { career } from '../career/career.data';
import { period } from '../period/period.data';
import { Course } from './course.types';
import { schedule } from './schedule/schedule.data';

export const courses: Course[] = [];
export const course: Course = {
  dependency: '0',
  id_course: '',
  company: company,
  period: period,
  career: career,
  schedule: schedule,
  name_course: '',
  description_course: '',
  status_course: false,
  creation_date_course: '',
  deleted_course: false,
};
