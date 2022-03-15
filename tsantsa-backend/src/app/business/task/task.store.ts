import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Task } from './task.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvt.id_task, bvt.id_course, bvt.name_task, bvt.description_task, bvt.status_task, bvt.creation_date_task, bvt.limit_date, bvt.deleted_task, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule`;
const INNERS_JOIN: string = ` inner join business.view_course bvc on bvt.id_course = bvc.id_course
inner join business.view_period bvp on bvc.id_period = bvp.id_period
inner join business.view_career bvca on bvc.id_career = bvca.id_career
inner join business.view_schedule bvs on bvc.id_schedule = bvs.id_schedule`;

export const dml_task_create = (task: Task) => {
	return new Promise<Task[]>(async (resolve, reject) => {
		const query = `select * from business.dml_task_create_modified(${task.id_user_}, ${task.course.id_course})`;

		// console.log(query);

		try {
			const response = await clientTSANTSAPostgreSQL.query(query);
			resolve(response.rows);
		} catch (error: any) {
			if (error.detail == '_database') {
				reject({
					..._mensajes[3],
					descripcion: error.toString().slice(7),
				});
			} else {
				reject(error.toString());
			}
		}
	});
};

export const view_task = (task: Task) => {
	return new Promise<Task[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_task bvt${INNERS_JOIN}${
			task.name_task != 'query-all'
				? ` where lower(bvt.name_task) LIKE '%${task.name_task}%'`
				: ``
		} order by bvt.id_task desc`;

		// console.log(query);

		try {
			const response = await clientTSANTSAPostgreSQL.query(query);
			resolve(response.rows);
		} catch (error: any) {
			if (error.detail == '_database') {
				reject({
					..._mensajes[3],
					descripcion: error.toString().slice(7),
				});
			} else {
				reject(error.toString());
			}
		}
	});
};

export const view_task_specific_read = (task: Task) => {
	return new Promise<Task[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_task bvt ${INNERS_JOIN} where bvt.id_task = ${task.id_task}`;

		// console.log(query);

		try {
			const response = await clientTSANTSAPostgreSQL.query(query);
			resolve(response.rows);
		} catch (error: any) {
			if (error.detail == '_database') {
				reject({
					..._mensajes[3],
					descripcion: error.toString().slice(7),
				});
			} else {
				reject(error.toString());
			}
		}
	});
};

export const dml_task_update = (task: Task) => {
	return new Promise<Task[]>(async (resolve, reject) => {
		const query = `select * from business.dml_task_update_modified(${task.id_user_},
			${task.id_task},
			${task.course.id_course},
			'${task.name_task}',
			'${task.description_task}',
			${task.status_task},
			'${task.creation_date_task}',
			'${task.limit_date}',
			${task.deleted_task})`;

		// console.log(query);

		try {
			const response = await clientTSANTSAPostgreSQL.query(query);
			resolve(response.rows);
		} catch (error: any) {
			if (error.detail == '_database') {
				reject({
					..._mensajes[3],
					descripcion: error.toString().slice(7),
				});
			} else {
				reject(error.toString());
			}
		}
	});
};

export const dml_task_send = (task: Task) => {
	return new Promise<Task[]>(async (resolve, reject) => {
		const query = `select * from business.dml_task_send(${task.id_user_},
			${task.id_task},
			${task.course.id_course},
			'${task.name_task}',
			'${task.description_task}',
			${task.status_task},
			'${task.creation_date_task}',
			'${task.limit_date}',
			${task.deleted_task})`;

		// console.log(query);

		try {
			const response = await clientTSANTSAPostgreSQL.query(query);
			resolve(response.rows);
		} catch (error: any) {
			if (error.detail == '_database') {
				reject({
					..._mensajes[3],
					descripcion: error.toString().slice(7),
				});
			} else {
				reject(error.toString());
			}
		}
	});
};

export const dml_task_delete = (task: Task) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_task_delete(${task.id_user_},${task.id_task}) as result`;

		// console.log(query);

		try {
			const response = await clientTSANTSAPostgreSQL.query(query);
			resolve(response.rows[0].result);
		} catch (error: any) {
			if (error.detail == '_database') {
				reject({
					..._mensajes[3],
					descripcion: error.toString().slice(7),
				});
			} else {
				reject(error.toString());
			}
		}
	});
};
