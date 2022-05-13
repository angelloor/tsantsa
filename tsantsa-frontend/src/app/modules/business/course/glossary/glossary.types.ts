import { Course } from '../course.types';

export interface Glossary {
  id_glossary: string;
  course: Course;
  term_glossary: string;
  concept_glossary: string;
  date_glossary: string;
  deleted_glossary: boolean;
}
