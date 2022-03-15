import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { ProfileNavigation } from './profile_navigation.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `vpn.id_profile_navigation, vpn.id_profile, vpn.id_navigation, vp.type_profile, vp.name_profile, vp.description_profile, vp.status_profile, vn.name_navigation, vn.description_navigation, vn.type_navigation, vn.status_navigation, vn.content_navigation`;
const INNERS_JOIN: string = ` inner join core.view_profile vp on vpn.id_profile = vp.id_profile
inner join core.view_navigation vn on vpn.id_navigation = vn.id_navigation`;

export const dml_profile_navigation_create = (
	profile_navigation: ProfileNavigation
) => {
	return new Promise<ProfileNavigation[]>(async (resolve, reject) => {
		const query = `select * from core.dml_profile_navigation_create_modified(${profile_navigation.id_user_},${profile_navigation.profile.id_profile})`;

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

export const view_profile_navigation_by_profile_read = (
	profile_navigation: ProfileNavigation
) => {
	return new Promise<ProfileNavigation[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_profile_navigation vpn${INNERS_JOIN} where vpn.id_profile = ${profile_navigation.profile} order by vpn.id_profile_navigation asc`;

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

export const view_profile_navigation_specific_read = (
	profile_navigation: ProfileNavigation
) => {
	return new Promise<ProfileNavigation[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_profile_navigation vpn ${INNERS_JOIN} where vpn.id_profile_navigation = ${profile_navigation.id_profile_navigation}`;

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

export const dml_profile_navigation_update = (
	profile_navigation: ProfileNavigation
) => {
	return new Promise<ProfileNavigation[]>(async (resolve, reject) => {
		const query = `select * from core.dml_profile_navigation_update_modified(${profile_navigation.id_user_},
			${profile_navigation.id_profile_navigation},
			${profile_navigation.profile.id_profile},
			${profile_navigation.navigation.id_navigation})`;

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

export const dml_profile_navigation_delete = (
	profile_navigation: ProfileNavigation
) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from core.dml_profile_navigation_delete(${profile_navigation.id_user_},${profile_navigation.id_profile_navigation}) as result`;

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
