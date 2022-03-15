import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Navigation } from './navigation.class';

export const dml_navigation_create = (navigation: Navigation) => {
	return new Promise<Navigation[]>(async (resolve, reject) => {
		const query = `select * from core.dml_navigation_create_modified(${navigation.id_user_})`;

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

export const view_navigation = (navigation: Navigation, id_company: string) => {
	return new Promise<Navigation[]>(async (resolve, reject) => {
		const query = `select * from core.view_navigation v${
			navigation.name_navigation != 'query-all'
				? ` where lower(v.name_navigation) LIKE '%${navigation.name_navigation}%' and v.id_company = ${id_company}`
				: ` where v.id_company = ${id_company}`
		} order by v.id_navigation desc`;

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

export const view_navigation_specific_read = (
	navigation: Navigation,
	id_company: string
) => {
	return new Promise<Navigation[]>(async (resolve, reject) => {
		const query = `select * from core.view_navigation v where v.id_navigation = ${navigation.id_navigation} and v.id_company = ${id_company}`;

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

export const dml_navigation_update = (navigation: Navigation) => {
	return new Promise<Navigation[]>(async (resolve, reject) => {
		const query = `select * from core.dml_navigation_update_modified(${
			navigation.id_user_
		},
			${navigation.id_navigation},
			${navigation.company.id_company},
			'${navigation.name_navigation}',
			'${navigation.description_navigation}',
			'${navigation.type_navigation}',
			${navigation.status_navigation},
			'${JSON.stringify(navigation.content_navigation)}',
			${navigation.deleted_navigation})`;

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

export const dml_navigation_delete = (navigation: Navigation) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from core.dml_navigation_delete(${navigation.id_user_},${navigation.id_navigation}) as result`;

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
