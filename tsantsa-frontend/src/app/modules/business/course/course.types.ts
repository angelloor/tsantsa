import { Company } from 'app/modules/core/company/company.types';
import { Career } from '../career/career.types';
import { Period } from '../period/period.types';
import { Schedule } from './schedule/schedule.types';

export interface Course {
  dependency: string;
  id_course: string;
  company: Company;
  period: Period;
  career: Career;
  schedule: Schedule;
  name_course: string;
  description_course: string;
  status_course: boolean;
  creation_date_course: string;
  tasks?: string;
  deleted_course: boolean;
}
