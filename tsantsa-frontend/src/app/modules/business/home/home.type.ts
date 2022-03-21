export type Box = {
  total_career: string;
  total_career_activated: string;
  total_course: string;
  total_course_activated: string;
  total_task: string;
  total_task_sent: string;
  total_user: string;
  total_user_activated: string;
};

export const _box: Box = {
  total_career: '1',
  total_career_activated: '1',
  total_course: '1',
  total_course_activated: '1',
  total_task: '4',
  total_task_sent: '4',
  total_user: '2',
  total_user_activated: '2',
};

export const _details: any = {
  details: {
    columns: [
      'name_period',
      'students',
      'teachers',
      'courses',
      'tasks',
      'approval_note_period',
    ],
    rows: [],
  },
};
