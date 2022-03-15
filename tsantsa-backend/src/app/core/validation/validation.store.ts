import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Validation } from './validation.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `vv.id_validation, vv.id_company, vv.type_validation, vv.status_validation, vv.pattern_validation, vv.message_validation, vv.deleted_validation, vc.name_company, vc.status_company`;
const INNERS_JOIN: string = ` inner join core.view_company vc on vv.id_company = vc.id_company`;

export const dml_validation_create = (validation: Validation) => {
	return new Promise<Validation[]>(async (resolve, reject) => {
		const query = `select * from core.dml_validation_create_modified(${validation.id_user_},'${validation.type_validation}')`;

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

export const view_validation = (validation: Validation, id_company: string) => {
	return new Promise<Validation[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_validation vv${INNERS_JOIN}${
			validation.message_validation != 'query-all'
				? ` where lower(vv.message_validation) LIKE '%${validation.message_validation}%'
					or lower(vv.type_validation::character varying) LIKE '%${validation.message_validation}%' and vv.id_company = ${id_company}`
				: ` where vv.id_company = ${id_company}`
		} order by vv.id_validation desc`;

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

export const view_validation_by_type_validation_read = (
	validation: Validation,
	id_company: string
) => {
	return new Promise<Validation[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_validation vv ${INNERS_JOIN} where vv.type_validation = '${validation.type_validation}' and vv.status_validation = true and vv.id_company = ${id_company}`;

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

export const view_validation_specific_read = (
	validation: Validation,
	id_company: string
) => {
	return new Promise<Validation[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_validation vv ${INNERS_JOIN} where vv.id_validation = ${validation.id_validation} and vv.id_company = ${id_company}`;

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

export const view_validation_inner_company_user = (
	type_validation: string,
	name_user: string
) => {
	return new Promise<Validation>(async (resolve, reject) => {
		const query = `select * from core.view_validation_inner_company_user v where v.type_validation = '${type_validation}' and v.name_user = '${name_user}'`;

		// console.log(query);

		try {
			const response = await clientTSANTSAPostgreSQL.query(query);
			resolve(response.rows[0]);
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

export const dml_validation_update = (validation: Validation) => {
	return new Promise<Validation[]>(async (resolve, reject) => {
		const query = `select * from core.dml_validation_update_modified(${validation.id_user_},
			${validation.id_validation},
			${validation.company.id_company},
			'${validation.type_validation}',
			${validation.status_validation},
			'${validation.pattern_validation}',
			'${validation.message_validation}',
			${validation.deleted_validation})`;

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

export const dml_validation_delete = (validation: Validation) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from core.dml_validation_delete(${validation.id_user_},${validation.id_validation}) as result`;

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
