import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Session } from './session.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `vs.id_session as id_session_, vs.id_user, vs.host_session, vs.agent_session, vs.date_sign_in_session, vs.date_sign_out_session, vs.status_session, vu.id_company, vu.id_person, vu.id_profile, vu.type_user, vu.name_user, vu.password_user, vu.avatar_user, vu.status_user, vc.id_setting, vc.name_company, vc.status_company, vp.id_academic, vp.id_job, vp.dni_person, vp.name_person, vp.last_name_person, vp.address_person, vp.phone_person, vpr.type_profile, vpr.name_profile, vpr.description_profile, vpr.status_profile`;
const INNERS_JOIN: string = ` inner join core.view_user vu on vs.id_user = vu.id_user
inner join core.view_company vc on vu.id_company = vc.id_company
inner join core.view_person vp on vu.id_person = vp.id_person
inner join core.view_profile vpr on vu.id_profile = vpr.id_profile`;

export const view_session = (session: Session, id_company: string) => {
	return new Promise<Session[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_session vs${INNERS_JOIN} ${
			session.host_session != 'query-all'
				? ` where lower(vs.host_session) LIKE '%${session.host_session}%'
					or lower(vu.name_user) LIKE '%${session.host_session}%' and vu.id_company = ${id_company}`
				: ` where vu.id_company = ${id_company}`
		} order by vs.id_session desc`;

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

export const view_session_specific_read = (
	session: Session,
	id_company: string
) => {
	return new Promise<Session[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_session vs ${INNERS_JOIN} where vs.id_session = ${session.id_session} and vu.id_company = ${id_company}`;

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

export const view_session_by_user_read = (
	session: Session,
	id_company: string
) => {
	return new Promise<Session[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_session vs ${INNERS_JOIN} where vs.id_user = ${session.user} and vu.id_company = ${id_company}`;

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

export const dml_session_by_session_release = (session: Session) => {
	return new Promise<Session[]>(async (resolve, reject) => {
		const query = `select * from core.dml_session_by_session_release(${session.id_user_},${session.id_session})`;

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

export const dml_session_by_user_release_all = (session: Session) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from core.dml_session_by_user_release_all(${session.id_user_},${session.user.id_user}) as result`;

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

export const dml_session_by_company_release_all = (session: Session) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from core.dml_session_by_company_release_all(${session.id_user_},${session.user.company.id_company}) as result`;

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
