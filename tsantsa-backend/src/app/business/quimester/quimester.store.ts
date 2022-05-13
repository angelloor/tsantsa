import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Quimester } from './quimester.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvq.id_quimester, bvq.id_period, bvq.name_quimester, bvq.description_quimester, bvq.deleted_quimester, bvp.id_company, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period`;
const INNERS_JOIN: string = ` inner join business.view_period bvp on bvq.id_period = bvp.id_period`;

export const dml_quimester_create = (quimester: Quimester) => {
	return new Promise<Quimester[]>(async (resolve, reject) => {
		const query = `select * from business.dml_quimester_create_modified(${quimester.id_user_},${quimester.period.id_period})`;

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

export const view_quimester = (quimester: Quimester) => {
	return new Promise<Quimester[]>(async (resolve, reject) => {
		const period: any = quimester.period!;

		const query = `select ${COLUMNS_RETURN} from business.view_quimester bvq${INNERS_JOIN}${
			quimester.name_quimester != 'query-all'
				? ` where lower(bvq.name_quimester) LIKE '%${
						quimester.name_quimester
				  }%' ${period != '*' ? `and bvq.id_period = ${period}` : ''}`
				: ` ${period != '*' ? `where bvq.id_period = ${period}` : ''}`
		} order by bvq.id_quimester desc`;

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

export const view_quimester_specific_read = (quimester: Quimester) => {
	return new Promise<Quimester[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_quimester bvq ${INNERS_JOIN} where bvq.id_quimester = ${quimester.id_quimester}`;

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

export const view_quimester_by_period_read = (quimester: Quimester) => {
	return new Promise<Quimester[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_quimester bvq ${INNERS_JOIN} where bvq.id_period = ${quimester.period}`;

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

export const dml_quimester_update = (quimester: Quimester) => {
	return new Promise<Quimester[]>(async (resolve, reject) => {
		const query = `select * from business.dml_quimester_update_modified(${quimester.id_user_},
			${quimester.id_quimester},
			${quimester.period.id_period},
			'${quimester.name_quimester}',
			'${quimester.description_quimester}',
			${quimester.deleted_quimester})`;

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

export const dml_quimester_delete = (quimester: Quimester) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_quimester_delete(${quimester.id_user_},${quimester.id_quimester}) as result`;

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
