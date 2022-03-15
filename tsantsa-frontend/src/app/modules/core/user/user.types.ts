import { Company } from '../company/company.types';
import { Profile } from '../profile/profile.types';
import { Person } from './person/person.types';

export interface User {
  id_user: string;
  company: Company;
  person: Person;
  profile: Profile;
  type_user: string;
  name_user: string;
  password_user: string;
  avatar_user: string;
  status_user: boolean;
  isSelected?: boolean;
  deleted_user: boolean;
}
/**
 * Type Enum
 */
export type TYPE_USER = 'student' | 'teacher';

export interface TYPE_USER_ENUM {
  name_type: string;
  value_type: TYPE_USER;
}

export const _typeUser: TYPE_USER_ENUM[] = [
  {
    name_type: 'Estudiante',
    value_type: 'student',
  },
  {
    name_type: 'Maestro',
    value_type: 'teacher',
  },
];
/**
 * Type Enum
 */
