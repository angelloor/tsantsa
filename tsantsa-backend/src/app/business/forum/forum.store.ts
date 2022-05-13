import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Forum } from './forum.class';
/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvf.id_forum, bvf.id_course, bvf.id_user, bvf.title_forum, bvf.description_forum, bvf.date_forum, bvf.deleted_forum, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, cvu.id_company, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person`;
const INNERS_JOIN: string = ` inner join business.view_course bvc on bvf.id_course = bvc.id_course
inner join core.view_user cvu on bvf.id_user = cvu.id_user
inner join core.view_person cvp on cvu.id_person = cvp.id_person`;

export const dml_forum_create = (forum: Forum) => {
	return new Promise<Forum[]>(async (resolve, reject) => {
		const query = `select * from business.dml_forum_create_modified(${forum.id_user_}, ${forum.course.id_course})`;

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

export const view_forum = (forum: Forum) => {
	return new Promise<Forum[]>(async (resolve, reject) => {
		const course: any = forum.course;

		const query = `select ${COLUMNS_RETURN} from business.view_forum bvf${INNERS_JOIN}${
			forum.title_forum != 'query-all'
				? ` where lower(bvf.title_forum) LIKE '%${forum.title_forum}%' ${
						course != '*' ? `and bvf.id_course = ${course}` : ''
				  }`
				: ` ${course != '*' ? `where bvf.id_course = ${course}` : ''}`
		} order by bvf.id_forum desc`;

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

export const view_forum_specific_read = (forum: Forum) => {
	return new Promise<Forum[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_forum bvf ${INNERS_JOIN} where bvf.id_forum = ${forum.id_forum}`;

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

export const view_forum_by_course_read = (forum: Forum) => {
	return new Promise<Forum[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_forum bvf ${INNERS_JOIN} where bvf.id_course = ${forum.course}`;

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

export const dml_forum_update = (forum: Forum) => {
	return new Promise<Forum[]>(async (resolve, reject) => {
		const query = `select * from business.dml_forum_update_modified(${forum.id_user_},
			${forum.id_forum},
			${forum.course.id_course},
			${forum.user.id_user},
			'${forum.title_forum}',
			'${forum.description_forum}',
			'${forum.date_forum}',
			${forum.deleted_forum})`;

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

export const dml_forum_delete = (forum: Forum) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_forum_delete(${forum.id_user_},${forum.id_forum}) as result`;

		console.log(query);

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
