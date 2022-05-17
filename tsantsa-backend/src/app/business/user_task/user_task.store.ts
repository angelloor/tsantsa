import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { UserTask } from './user_task.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvut.id_user_task, bvut.id_user as bvut_id_user, bvut.id_task, bvut.response_user_task, bvut.shipping_date_user_task, bvut.qualification_user_task, bvut.is_open, bvut.is_dispatched, bvut.is_qualified, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person, cvt.id_course, cvt.id_partial, cvt.name_task, cvt.id_user as vt_id_user, cvt.description_task, cvt.status_task, cvt.creation_date_task, cvt.limit_date, bvpa.id_quimester, bvpa.name_partial, bvq.id_period, bvq.name_quimester, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.maximum_rating, bvp.approval_note_period`;
const INNERS_JOIN: string = ` inner join core.view_user cvu on bvut.id_user = cvu.id_user
inner join core.view_person cvp on cvu.id_person = cvp.id_person
inner join business.view_task cvt  on bvut.id_task = cvt.id_task
inner join business.view_partial bvpa on cvt.id_partial = bvpa.id_partial
inner join business.view_quimester bvq on bvpa.id_quimester = bvq.id_quimester
inner join business.view_course bvc on cvt.id_course = bvc.id_course
inner join business.view_period bvp on bvc.id_period = bvp.id_period`;

export const dml_user_task_create = (user_task: UserTask) => {
	return new Promise<UserTask[]>(async (resolve, reject) => {
		const query = `select * from business.dml_user_task_create_modified(${user_task.id_user_}, ${user_task.user.id_user}, ${user_task.task.id_task})`;

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

export const view_user_task = (user_task: UserTask) => {
	return new Promise<UserTask[]>(async (resolve, reject) => {
		const name_person: any = user_task.user;

		const query = `select ${COLUMNS_RETURN} from business.view_user_task bvut${INNERS_JOIN}${
			name_person != 'query-all'
				? ` where lower(cvp.name_person) LIKE '%${name_person}%' or lower(cvp.last_name_person) LIKE '%${name_person}%'`
				: ``
		} order by bvut.id_user_task desc`;

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

export const view_user_task_by_task_query_read = (user_task: UserTask) => {
	return new Promise<UserTask[]>(async (resolve, reject) => {
		const task: any = user_task.task;
		const name_person: any = user_task.user;

		const query = `select ${COLUMNS_RETURN} from business.view_user_task bvut${INNERS_JOIN}${
			name_person != 'query-all'
				? ` where (lower(cvp.name_person) LIKE '%${name_person}%' or lower(cvp.last_name_person) LIKE '%${name_person}%') and bvut.id_task = ${task}`
				: ` where bvut.id_task = ${task}`
		} order by bvut.id_user_task desc`;

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

export const view_user_task_by_course_query_read = (user_task: UserTask) => {
	return new Promise<UserTask[]>(async (resolve, reject) => {
		const course: any = user_task.task;
		const name_person: any = user_task.user;

		const query = `select ${COLUMNS_RETURN} from business.view_user_task bvut${INNERS_JOIN}${
			name_person != 'query-all'
				? ` where (lower(cvt.name_Task) LIKE '%${name_person}%') and bvc.id_course = ${course}`
				: ` where bvc.id_course = ${course}`
		} order by bvut.id_user_task desc`;

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

export const view_user_task_specific_read = (user_task: UserTask) => {
	return new Promise<UserTask[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_user_task bvut ${INNERS_JOIN} where bvut.id_user_task = ${user_task.id_user_task}`;

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

export const view_user_task_by_user_read = (user_task: UserTask) => {
	return new Promise<UserTask[]>(async (resolve, reject) => {
		const course: any = user_task.task.course.id_course;
		const partial: any = user_task.response_user_task;
		const query = `select ${COLUMNS_RETURN} from business.view_user_task bvut ${INNERS_JOIN} where bvut.id_user = ${user_task.user} and bvc.id_course = ${course} and cvt.id_partial = ${partial}`;

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

export const view_user_task_by_sender_user_read = (user_task: UserTask) => {
	return new Promise<UserTask[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_user_task bvut ${INNERS_JOIN} where cvt.id_user = ${user_task.user}`;

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

export const view_user_task_by_task_read = (user_task: UserTask) => {
	return new Promise<UserTask[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_user_task bvut ${INNERS_JOIN} where cvt.id_task = ${user_task.task}`;

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

export const view_user_task_by_course_read = (user_task: UserTask) => {
	return new Promise<UserTask[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_user_task bvut ${INNERS_JOIN} where bvc.id_course = ${user_task.task}`;

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

export const dml_user_task_update = (user_task: UserTask) => {
	return new Promise<UserTask[]>(async (resolve, reject) => {
		const query = `select * from business.dml_user_task_update_modified(${
			user_task.id_user_
		},
			${user_task.id_user_task},
			${user_task.user.id_user},
			${user_task.task.id_task},
			'${user_task.response_user_task}',
			${
				user_task.shipping_date_user_task == null
					? user_task.shipping_date_user_task
					: `'${user_task.shipping_date_user_task}'`
			},
			${user_task.qualification_user_task},
			${user_task.is_open},
			${user_task.is_dispatched},
			${user_task.is_qualified})`;

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

export const dml_user_task_delete = (user_task: UserTask) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_user_task_delete(${user_task.id_user_},${user_task.id_user_task}) as result`;

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
