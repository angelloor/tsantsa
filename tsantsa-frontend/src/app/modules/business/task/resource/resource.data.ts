import { task } from '../task.data';
import { Resource } from './resource.types';

export const resources: Resource[] = [];
export const resource: Resource = {
  id_resource: '',
  task: task,
  name_resource: '',
  description_resource: '',
  link_resource: '',
  deleted_resource: false,
};
