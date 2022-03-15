import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Attached } from './attached.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bva.id_attached, bva.id_user_task, bva.file_name, bva.length_mb, bva.extension, bva.server_path, bva.upload_date, bvut.id_user, bvut.id_task, bvut.response_user_task, bvut.shipping_date_user_task, bvut.qualification_user_task, bvut.is_open, bvut.is_dispatched, bvut.is_qualified, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person, cvt.id_course, cvt.name_task, cvt.description_task, cvt.status_task, cvt.creation_date_task, cvt.limit_date, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course`;
const INNERS_JOIN: string = ` inner join business.view_user_task bvut on bva.id_user_task = bvut.id_user_task
inner join core.view_user cvu on bvut.id_user = cvu.id_user
inner join core.view_person cvp on cvu.id_person = cvp.id_person
inner join business.view_task cvt  on bvut.id_task = cvt.id_task
inner join business.view_course bvc on cvt.id_course = bvc.id_course`;

export const dml_attached_create = (attached: Attached) => {
	return new Promise<Attached[]>(async (resolve, reject) => {
		const query = `select * from business.dml_attached_create_modified(${attached.id_user_}, 
			${attached.user_task.id_user_task},
			'${attached.file_name}',
			'${attached.length_mb}',
			'${attached.extension}',
			'${attached.server_path}')`;

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

export const view_attached = (attached: Attached) => {
	return new Promise<Attached[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_attached bva${INNERS_JOIN}${
			attached.file_name != 'query-all'
				? ` where lower(bva.file_name) LIKE '%${attached.file_name}%'`
				: ``
		} order by bva.id_attached desc`;

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

export const view_attached_specific_read = (attached: Attached) => {
	return new Promise<Attached[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_attached bva ${INNERS_JOIN} where bva.id_attached = ${attached.id_attached}`;

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

export const view_attached_by_user_task_read = (attached: Attached) => {
	return new Promise<Attached[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_attached bva ${INNERS_JOIN} where bva.id_user_task = ${attached.user_task}`;

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

export const dml_attached_delete = (attached: Attached) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_attached_delete(${attached.id_user_},${attached.id_attached}) as result`;

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
