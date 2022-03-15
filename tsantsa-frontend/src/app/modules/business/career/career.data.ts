import { company } from 'app/modules/core/company/company.data';
import { Career } from './career.types';

export const careers: Career[] = [];
export const career: Career = {
  id_career: '',
  company: company,
  name_career: '',
  description_career: '',
  status_career: false,
  creation_date_career: '',
  deleted_career: false,
};
