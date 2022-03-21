import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Period } from './period.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `(select * from core.utils_get_table_dependency('business', 'period', bvp.id_period) as dependency), bvp.id_period, bvp.id_company, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvp.deleted_period, cvc.name_company, cvc.acronym_company, cvc.address_company, cvc.status_company`;
const INNERS_JOIN: string = ` inner join core.view_company cvc on bvp.id_company = cvc.id_company`;

export const dml_period_create = (period: Period) => {
	return new Promise<Period[]>(async (resolve, reject) => {
		const query = `select * from business.dml_period_create_modified(${period.id_user_})`;

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

export const view_period = (period: Period, id_company: string) => {
	return new Promise<Period[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_period bvp${INNERS_JOIN}${
			period.name_period != 'query-all'
				? ` where lower(bvp.name_period) LIKE '%${period.name_period}%' and bvp.id_company = ${id_company}`
				: ` where bvp.id_company = ${id_company}`
		} order by bvp.id_period desc`;

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

export const view_period_specific_read = (
	period: Period,
	id_company: string
) => {
	return new Promise<Period[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_period bvp ${INNERS_JOIN} where bvp.id_period = ${period.id_period} and bvp.id_company = ${id_company}`;

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

export const dml_period_update = (period: Period) => {
	return new Promise<Period[]>(async (resolve, reject) => {
		const query = `select * from business.dml_period_update_modified(${period.id_user_},
			${period.id_period},
			${period.company.id_company},
			'${period.name_period}',
			'${period.description_period}',
			'${period.start_date_period}',
			'${period.end_date_period}',
			${period.maximum_rating},
			${period.approval_note_period},
			${period.deleted_period})`;

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

export const dml_period_delete = (period: Period) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_period_delete(${period.id_user_},${period.id_period}) as result`;

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
