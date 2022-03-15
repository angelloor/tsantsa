import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Comment } from './comment.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvc.id_comment, bvc.id_user_task, bvc.id_user, bvc.value_comment, bvc.date_comment, bvc.deleted_comment, bvut.id_task, bvut.response_user_task, bvut.shipping_date_user_task, bvut.qualification_user_task, bvut.is_open, bvut.is_dispatched, bvut.is_qualified, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person`;
const INNERS_JOIN: string = ` inner join business.view_user_task bvut on bvc.id_user_task = bvut.id_user_task
inner join core.view_user cvu on bvc.id_user = cvu.id_user
inner join core.view_person cvp on cvu.id_person = cvp.id_person`;

export const dml_comment_create = (comment: Comment) => {
	return new Promise<Comment[]>(async (resolve, reject) => {
		const query = `select * from business.dml_comment_create_modified(${comment.id_user_}, ${comment.user_task.id_user_task})`;

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

export const view_comment = (comment: Comment) => {
	return new Promise<Comment[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_comment bvc${INNERS_JOIN}${
			comment.value_comment != 'query-all'
				? ` where lower(bvc.value_comment) LIKE '%${comment.value_comment}%'`
				: ``
		} order by bvc.id_comment desc`;

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

export const view_comment_specific_read = (comment: Comment) => {
	return new Promise<Comment[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_comment bvc ${INNERS_JOIN} where bvc.id_comment = ${comment.id_comment}`;

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

export const view_comment_by_user_task_read = (comment: Comment) => {
	return new Promise<Comment[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_comment bvc ${INNERS_JOIN} where bvc.id_user_task = ${comment.user_task}`;

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

export const dml_comment_update = (comment: Comment) => {
	return new Promise<Comment[]>(async (resolve, reject) => {
		const query = `select * from business.dml_comment_update_modified(${comment.id_user_},
			${comment.id_comment},
			${comment.user_task.id_user_task},
			${comment.user.id_user},
			'${comment.value_comment}',
			'${comment.date_comment}',
			${comment.deleted_comment})`;

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

export const dml_comment_delete = (comment: Comment) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_comment_delete(${comment.id_user_},${comment.id_comment}) as result`;

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
