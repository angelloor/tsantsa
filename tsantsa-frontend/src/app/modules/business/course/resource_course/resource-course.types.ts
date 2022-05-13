import { User } from 'app/modules/core/user/user.types';
import { Course } from '../course.types';

export interface ResourceCourse {
  id_resource_course: string;
  course: Course;
  user: User;
  file_name: string;
  length_mb: string;
  extension: string;
  server_path: string;
  upload_date: string;
}
/**
 * Type Enum
 */
export type TYPE_RESOURCE_COURSE = '.docx' | '.pdf' | '.xlsx' | '.pptx';

export interface TYPE_RESOURCE_COURSE_ENUM {
  name_type: string;
  value_type: TYPE_RESOURCE_COURSE;
}

export const _typeResourceCourse: TYPE_RESOURCE_COURSE_ENUM[] = [
  {
    name_type: 'Documento de WORD',
    value_type: '.docx',
  },
  {
    name_type: 'Documento PDF',
    value_type: '.pdf',
  },
  {
    name_type: 'Libro de Excel',
    value_type: '.xlsx',
  },
  {
    name_type: 'PowerPoint Presentación',
    value_type: '.pptx',
  },
];
/**
 * Type Enum
 */
