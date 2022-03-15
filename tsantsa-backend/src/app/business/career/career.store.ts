import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Career } from './career.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvc.id_career, bvc.id_company, bvc.name_career, bvc.description_career, bvc.status_career, bvc.creation_date_career, bvc.deleted_career, cvc.name_company, cvc.acronym_company, cvc.address_company, cvc.status_company`;
const INNERS_JOIN: string = ` inner join core.view_company cvc on bvc.id_company = cvc.id_company`;

export const dml_career_create = (career: Career) => {
	return new Promise<Career[]>(async (resolve, reject) => {
		const query = `select * from business.dml_career_create_modified(${career.id_user_})`;

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

export const view_career = (career: Career) => {
	return new Promise<Career[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_career bvc${INNERS_JOIN}${
			career.name_career != 'query-all'
				? ` where lower(bvc.name_career) LIKE '%${career.name_career}%'`
				: ``
		} order by bvc.id_career desc`;

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

export const view_career_specific_read = (career: Career) => {
	return new Promise<Career[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_career bvc ${INNERS_JOIN} where bvc.id_career = ${career.id_career}`;

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

export const dml_career_update = (career: Career) => {
	return new Promise<Career[]>(async (resolve, reject) => {
		const query = `select * from business.dml_career_update_modified(${career.id_user_},
			${career.id_career},
			${career.company.id_company},
			'${career.name_career}',
			'${career.description_career}',
			${career.status_career},
			'${career.creation_date_career}',
			${career.deleted_career})`;

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

export const dml_career_delete = (career: Career) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_career_delete(${career.id_user_},${career.id_career}) as result`;

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
