export interface Box {
	id_box: string;
	value_box: string;
	other_value_box: string;
}

export interface Details {
	columns: string[];
	rows: Row[];
}

export interface Row {
	id: string;
	period: string;
	total_students: string;
	total_teacher: string;
	total_courses: string;
	total_task: string;
	total_task_completed: string;
}
