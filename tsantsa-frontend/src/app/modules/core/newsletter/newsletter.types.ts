import { Company } from '../company/company.types';
import { User } from '../user/user.types';

export interface Newsletter {
  id_newsletter: string;
  company: Company;
  user: User;
  name_newsletter: string;
  description_newsletter: string;
  date_newsletter: string;
  deleted_newsletter: boolean;
}
