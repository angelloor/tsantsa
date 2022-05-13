import { company } from '../company/company.data';
import { user } from '../user/user.data';
import { Newsletter } from './newsletter.types';

export const newsletters: Newsletter[] = [];
export const newsletter: Newsletter = {
  id_newsletter: '',
  company: company,
  user: user,
  name_newsletter: '',
  description_newsletter: '',
  date_newsletter: '',
  deleted_newsletter: false,
};
