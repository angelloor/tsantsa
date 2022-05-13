import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Newsletter } from './newsletter.class';
/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `cvn.id_newsletter, cvn.id_company, cvn.id_user, cvn.name_newsletter, cvn.description_newsletter, cvn.date_newsletter, cvn.deleted_newsletter, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person `;
const INNERS_JOIN: string = ` inner join core.view_user cvu on cvn.id_user = cvu.id_user
inner join core.view_person cvp on cvu.id_person = cvp.id_person`;

export const dml_newsletter_create = (newsletter: Newsletter) => {
	return new Promise<Newsletter[]>(async (resolve, reject) => {
		const query = `select * from core.dml_newsletter_create_modified(${newsletter.id_user_}, ${newsletter.company.id_company})`;

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

export const view_newsletter = (newsletter: Newsletter) => {
	return new Promise<Newsletter[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_newsletter cvn${INNERS_JOIN}${
			newsletter.name_newsletter != 'query-all'
				? ` where lower(cvn.name_newsletter) LIKE '%${newsletter.name_newsletter}%'`
				: ``
		} order by cvn.id_newsletter desc`;

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

export const view_newsletter_specific_read = (newsletter: Newsletter) => {
	return new Promise<Newsletter[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_newsletter cvn ${INNERS_JOIN} where cvn.id_newsletter = ${newsletter.id_newsletter}`;

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

export const view_newsletter_by_company_read = (newsletter: Newsletter) => {
	return new Promise<Newsletter[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_newsletter cvn ${INNERS_JOIN} where cvn.id_company = ${newsletter.company}`;

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

export const dml_newsletter_update = (newsletter: Newsletter) => {
	return new Promise<Newsletter[]>(async (resolve, reject) => {
		const query = `select * from core.dml_newsletter_update_modified(${newsletter.id_user_},
			${newsletter.id_newsletter},
			${newsletter.company.id_company},
			${newsletter.id_user_},
			'${newsletter.name_newsletter}',
			'${newsletter.description_newsletter}',
			'${newsletter.date_newsletter}',
			${newsletter.deleted_newsletter})`;

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

export const dml_newsletter_delete = (newsletter: Newsletter) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from core.dml_newsletter_delete(${newsletter.id_user_},${newsletter.id_newsletter}) as result`;

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
