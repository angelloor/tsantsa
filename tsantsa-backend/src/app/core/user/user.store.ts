import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { User } from './user.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `vu.id_user, vu.id_company, vu.id_person, vu.id_profile, vu.type_user, vu.name_user, vu.password_user, vu.avatar_user, vu.status_user, vu.deleted_user, vc.name_company, vc.status_company, vp.id_academic, vp.id_job, vp.dni_person, vp.name_person, vp.last_name_person, vp.address_person, vp.phone_person, va.title_academic, va.abbreviation_academic, va.nivel_academic, vj.name_job, vj.address_job, vj.phone_job, vj.position_job, vpr.type_profile, vpr.name_profile, vpr.description_profile, vpr.status_profile`;
const INNERS_JOIN: string = ` inner join core.view_company vc on vu.id_company = vc.id_company
inner join core.view_person vp on vu.id_person = vp.id_person
inner join core.view_academic va on vp.id_academic = va.id_academic
inner join core.view_job vj on vp.id_job = vj.id_job
inner join core.view_profile vpr on vu.id_profile = vpr.id_profile`;

export const dml_user_create = (user: User) => {
	return new Promise<User[]>(async (resolve, reject) => {
		const query = `select * from core.dml_user_create_modified(${user.id_user_})`;

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

export const view_user = (user: User, id_company: string) => {
	return new Promise<User[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_user vu${INNERS_JOIN}${
			user.name_user != 'query-all'
				? ` where lower(vu.name_user) LIKE '%${user.name_user}%'
					or lower(vp.dni_person) LIKE '%${user.name_user}%'
					or lower(vp.name_person) LIKE '%${user.name_user}%'
					or lower(vp.last_name_person) LIKE '%${user.name_user}%' and vu.id_company = ${id_company}`
				: ` where vu.id_company = ${id_company}`
		} order by vu.id_user desc`;

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

export const view_user_specific_read = (user: User, id_company: string) => {
	return new Promise<User[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_user vu ${INNERS_JOIN} where vu.id_user = ${user.id_user} and vu.id_company = ${id_company}`;

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

export const dml_user_update = (user: User) => {
	return new Promise<User[]>(async (resolve, reject) => {
		const query = `select * from core.dml_user_update_modified(${user.id_user_},
			${user.id_user},
			${user.company.id_company},
			${user.person.id_person},
			${user.profile.id_profile},
			'${user.type_user}',
			'${user.name_user}',
			'${user.password_user}',
			'${user.avatar_user}',
			${user.status_user},
			${user.deleted_user},
			${user.person.academic.id_academic},
			${user.person.job.id_job},
			'${user.person.dni_person}',
			'${user.person.name_person}',
			'${user.person.last_name_person}',
			'${user.person.address_person}',
			'${user.person.phone_person}',
			'${user.person.academic.title_academic}',
			'${user.person.academic.abbreviation_academic}',
			'${user.person.academic.nivel_academic}',
			'${user.person.job.name_job}',
			'${user.person.job.address_job}',
			'${user.person.job.phone_job}',
			'${user.person.job.position_job}')`;

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

export const dml_user_delete = (user: User) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from core.dml_user_delete_modified(${user.id_user_},${user.id_user}) as result`;

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

export const dml_user_upload_avatar = (user: User, new_avatar: string) => {
	return new Promise<any>(async (resolve, reject) => {
		const query = `select * from core.dml_user_upload_avatar(${user.id_user}, '${new_avatar}') as result`;

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

export const dml_user_remove_avatar = (user: User) => {
	return new Promise<any>(async (resolve, reject) => {
		const query = `select * from core.dml_user_remove_avatar(${user.id_user}) as result`;
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
