import { Quimester } from '../quimester.types';

export interface Partial {
  id_partial: string;
  quimester: Quimester;
  name_partial: string;
  description_partial: string;
  deleted_partial: boolean;
}
