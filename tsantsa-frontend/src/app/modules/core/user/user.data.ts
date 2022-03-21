import { company } from '../company/company.data';
import { profile } from '../profile/profile.data';
import { person } from './person/person.data';
import { User } from './user.types';

export const users: User[] = [];
export const user: User = {
  id_user: '',
  company: company,
  person: person,
  profile: profile,
  type_user: 'student',
  name_user: '',
  password_user: '',
  avatar_user: '',
  status_user: false,
  isSelected: false,
  deleted_user: false,
};
