import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { UserTask } from './user_task.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvut.id_user_task, bvut.id_user, bvut.id_task, bvut.response_user_task, bvut.shipping_date_user_task, bvut.qualification_user_task, bvut.is_open, bvut.is_dispatched, bvut.is_qualified, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person, cvt.id_course, cvt.name_task, cvt.description_task, cvt.status_task, cvt.creation_date_task, cvt.limit_date, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course`;
const INNERS_JOIN: string = ` inner join core.view_user cvu on bvut.id_user = cvu.id_user
inner join core.view_person cvp on cvu.id_person = cvp.id_person
inner join business.view_task cvt  on bvut.id_task = cvt.id_task
inner join business.view_course bvc on cvt.id_course = bvc.id_course`;

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
		const query = `select ${COLUMNS_RETURN} from business.view_user_task bvut${INNERS_JOIN}${
			user_task.response_user_task != 'query-all'
				? ` where lower(cvt.name_task) LIKE '%${user_task.response_user_task}%'`
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
		const query = `select ${COLUMNS_RETURN} from business.view_user_task bvut ${INNERS_JOIN} where bvut.id_user = ${user_task.user}`;

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
