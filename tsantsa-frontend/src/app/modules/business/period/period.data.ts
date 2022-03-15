import { company } from 'app/modules/core/company/company.data';
import { Period } from './period.types';

export const periods: Period[] = [];
export const period: Period = {
  id_period: '',
  company: company,
  name_period: '',
  description_period: '',
  start_date_period: '',
  end_date_period: '',
  maximum_rating: 1,
  approval_note_period: 1,
  deleted_period: false,
};
