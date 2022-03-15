import { clientTSANTSAPostgreSQL } from '../utils/conections';

export const utils_table_exists = (scheme: string, entity: string) => {
	return new Promise<any>(async (resolve, reject) => {
		const query = `select dev.utils_table_exists('${scheme}', '${entity}') as count`;

		try {
			const response = await clientTSANTSAPostgreSQL.query(query);
			resolve(response.rows[0].count);
		} catch (error: any) {
			reject(error.toString());
		}
	});
};

export const utils_get_columns_backend = (scheme: string, entity: string) => {
	return new Promise<any>(async (resolve, reject) => {
		const query = `select * from dev.utils_get_columns_backend('${scheme}', '${entity}')`;

		try {
			const response = await clientTSANTSAPostgreSQL.query(query);
			resolve(response.rows);
		} catch (error: any) {
			reject(error.toString());
		}
	});
};
