import { Company } from 'app/modules/core/company/company.types';

export interface Career {
  dependency: string;
  id_career: string;
  company: Company;
  name_career: string;
  description_career: string;
  status_career: boolean;
  creation_date_career: string;
  deleted_career: boolean;
}
