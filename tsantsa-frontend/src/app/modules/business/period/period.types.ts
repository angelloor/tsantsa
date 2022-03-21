import { Company } from 'app/modules/core/company/company.types';

export interface Period {
  dependency: string;
  id_period: string;
  company: Company;
  name_period: string;
  description_period: string;
  start_date_period: string;
  end_date_period: string;
  maximum_rating: number;
  approval_note_period: number;
  deleted_period: boolean;
}
