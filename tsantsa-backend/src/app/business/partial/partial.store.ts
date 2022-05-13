import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Partial } from './partial.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvp.id_partial, bvp.id_quimester, bvp.name_partial, bvp.description_partial, bvp.deleted_partial, bvq.id_period, bvq.name_quimester, bvq.description_quimester`;
const INNERS_JOIN: string = ` inner join business.view_quimester bvq on bvp.id_quimester = bvq.id_quimester`;

export const dml_partial_create = (partial: Partial) => {
	return new Promise<Partial[]>(async (resolve, reject) => {
		const query = `select * from business.dml_partial_create_modified(${partial.id_user_}, ${partial.quimester.id_quimester})`;

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

export const view_partial = (partial: Partial) => {
	return new Promise<Partial[]>(async (resolve, reject) => {
		const quimester: any = partial.quimester;

		const query = `select ${COLUMNS_RETURN} from business.view_partial bvp${INNERS_JOIN}${
			partial.name_partial != 'query-all'
				? ` where lower(bvp.name_partial) LIKE '%${partial.name_partial}%' ${
						quimester != '*' ? `and bvp.id_quimester = ${quimester}` : ''
				  }`
				: ` ${quimester != '*' ? `where bvp.id_quimester = ${quimester}` : ''}`
		} order by bvp.id_partial desc`;

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

export const view_partial_specific_read = (partial: Partial) => {
	return new Promise<Partial[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_partial bvp ${INNERS_JOIN} where bvp.id_partial = ${partial.id_partial}`;

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

export const view_partial_by_quimester_read = (partial: Partial) => {
	return new Promise<Partial[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_partial bvp ${INNERS_JOIN} where bvp.id_quimester = ${partial.quimester}`;

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

export const dml_partial_update = (partial: Partial) => {
	return new Promise<Partial[]>(async (resolve, reject) => {
		const query = `select * from business.dml_partial_update_modified(${partial.id_user_},
			${partial.id_partial},
			${partial.quimester.id_quimester},
			'${partial.name_partial}',
			'${partial.description_partial}',
			${partial.deleted_partial})`;

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

export const dml_partial_delete = (partial: Partial) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_partial_delete(${partial.id_user_},${partial.id_partial}) as result`;

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
