import { Task } from '../task.types';

export interface Resource {
  id_resource: string;
  task: Task;
  name_resource: string;
  description_resource: string;
  link_resource: string;
  deleted_resource: boolean;
}
