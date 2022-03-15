import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Company } from './company.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `vc.id_company, vc.id_setting, vc.name_company, vc.acronym_company, vc.address_company, vc.status_company, vc.deleted_company, vs.expiration_token, vs.expiration_verification_code, vs.inactivity_time, vs.session_limit`;
const INNERS_JOIN: string = ` inner join core.view_setting vs on vc.id_setting = vs.id_setting`;

export const dml_company_create = (company: Company) => {
	return new Promise<Company[]>(async (resolve, reject) => {
		const query = `select * from core.dml_company_create_modified(${company.id_user_})`;

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

export const view_company = (company: Company) => {
	return new Promise<Company[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_company vc${INNERS_JOIN}${
			company.name_company != 'query-all'
				? ` where lower(vc.name_company) LIKE '%${company.name_company}%'`
				: ``
		} order by vc.id_company desc`;

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

export const view_company_specific_read = (company: Company) => {
	return new Promise<Company[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_company vc ${INNERS_JOIN} where vc.id_company = ${company.id_company}`;

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

export const dml_company_update = (company: Company) => {
	return new Promise<Company[]>(async (resolve, reject) => {
		const query = `select * from core.dml_company_update_modified(${company.id_user_},
			${company.id_company},
			${company.setting.id_setting},
			'${company.name_company}',
			'${company.acronym_company}',
			'${company.address_company}',
			${company.status_company},
			${company.deleted_company},
			${company.setting.expiration_token},
			${company.setting.expiration_verification_code},
			${company.setting.inactivity_time},
			${company.setting.session_limit})`;

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

export const dml_company_delete = (company: Company) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from core.dml_company_delete_modified(${company.id_user_},${company.id_company}) as result`;

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
