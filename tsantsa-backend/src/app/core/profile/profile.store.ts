import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Profile } from './profile.class';

export const dml_profile_create = (profile: Profile) => {
	return new Promise<Profile[]>(async (resolve, reject) => {
		const query = `select * from core.dml_profile_create_modified(${profile.id_user_})`;

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

export const view_profile = (profile: Profile, id_company: string) => {
	return new Promise<Profile[]>(async (resolve, reject) => {
		const query = `select * from core.view_profile v${
			profile.name_profile != 'query-all'
				? ` where lower(v.name_profile) LIKE '%${profile.name_profile}%' and v.id_company = ${id_company}`
				: ` where v.id_company = ${id_company}`
		} order by v.id_profile desc`;

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

export const view_profile_specific_read = (
	profile: Profile,
	id_company: string
) => {
	return new Promise<Profile[]>(async (resolve, reject) => {
		const query = `select * from core.view_profile v where v.id_profile = ${profile.id_profile} and v.id_company = ${id_company}`;

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

export const dml_profile_update = (profile: Profile) => {
	return new Promise<Profile[]>(async (resolve, reject) => {
		const query = `select * from core.dml_profile_update_modified(${profile.id_user_},
			${profile.id_profile},
			'${profile.company.id_company}',
			'${profile.type_profile}',
			'${profile.name_profile}',
			'${profile.description_profile}',
			${profile.status_profile},
			${profile.deleted_profile})`;

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

export const dml_profile_delete = (profile: Profile) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from core.dml_profile_delete_modified(${profile.id_user_},${profile.id_profile}) as result`;

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
