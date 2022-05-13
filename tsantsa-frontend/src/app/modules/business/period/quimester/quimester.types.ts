import { Period } from '../period.types';

export interface Quimester {
  id_quimester: string;
  period: Period;
  name_quimester: string;
  description_quimester: string;
  deleted_quimester: boolean;
}
