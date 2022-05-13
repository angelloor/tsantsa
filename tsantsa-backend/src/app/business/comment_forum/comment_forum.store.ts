import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { CommentForum } from './comment_forum.class';
/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvcf.id_comment_forum, bvcf.id_forum, bvcf.id_user, bvcf.value_comment_forum, bvcf.date_comment_forum, bvcf.deleted_comment_forum, bvf.id_course, bvf.title_forum, bvf.description_forum, bvf.date_forum, cvu.id_company, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person`;
const INNERS_JOIN: string = ` inner join business.view_forum bvf on bvcf.id_forum = bvf.id_forum
inner join core.view_user cvu on bvcf.id_user = cvu.id_user
inner join core.view_person cvp on cvu.id_person = cvp.id_person`;

export const dml_comment_forum_create = (comment_forum: CommentForum) => {
	return new Promise<CommentForum[]>(async (resolve, reject) => {
		const query = `select * from business.dml_comment_forum_create_modified(${comment_forum.id_user_}, ${comment_forum.forum.id_forum})`;

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

export const view_comment_forum = (comment_forum: CommentForum) => {
	return new Promise<CommentForum[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_comment_forum bvcf${INNERS_JOIN}${
			comment_forum.value_comment_forum != 'query-all'
				? ` where lower(bvcf.value_comment_forum) LIKE '%${comment_forum.value_comment_forum}%'`
				: ``
		} order by bvcf.id_comment_forum desc`;

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

export const view_comment_forum_specific_read = (
	comment_forum: CommentForum
) => {
	return new Promise<CommentForum[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_comment_forum bvcf ${INNERS_JOIN} where bvcf.id_comment_forum = ${comment_forum.id_comment_forum}`;

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

export const view_comment_forum_by_forum_read = (
	comment_forum: CommentForum
) => {
	return new Promise<CommentForum[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_comment_forum bvcf ${INNERS_JOIN} where bvcf.id_forum = ${comment_forum.forum} order by bvcf.id_comment_forum asc`;

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

export const dml_comment_forum_update = (comment_forum: CommentForum) => {
	return new Promise<CommentForum[]>(async (resolve, reject) => {
		const query = `select * from business.dml_comment_forum_update_modified(${comment_forum.id_user_},
			${comment_forum.id_comment_forum},
			${comment_forum.forum.id_forum},
			'${comment_forum.value_comment_forum}',
			${comment_forum.deleted_comment_forum})`;

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

export const dml_comment_forum_delete = (comment_forum: CommentForum) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_comment_forum_delete(${comment_forum.id_user_},${comment_forum.id_comment_forum}) as result`;

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
