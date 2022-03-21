import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Assistance } from './assistance.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bva.id_assistance, bva.id_user, bva.id_course, bva.start_marking_date, bva.end_marking_date, bva.is_late, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person`;
const INNERS_JOIN: string = ` inner join business.view_course bvc on bva.id_course = bvc.id_course
inner join business.view_schedule bvs on bvc.id_schedule = bvs.id_schedule
inner join core.view_user cvu on bva.id_user = cvu.id_user
inner join core.view_person cvp on cvu.id_person = cvp.id_person`;

export const dml_assistance_create = (assistance: Assistance) => {
	return new Promise<Assistance[]>(async (resolve, reject) => {
		const query = `select * from business.dml_assistance_create_modified(${assistance.id_user_}, ${assistance.course.id_course})`;

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

export const view_assistance = (assistance: Assistance) => {
	return new Promise<Assistance[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_assistance bva${INNERS_JOIN}${
			assistance.course.toString() != 'query-all'
				? ` where lower(bvc.name_course) LIKE '%${assistance.course.toString()}%'`
				: ``
		} order by bva.id_assistance desc`;

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

export const view_assistance_specific_read = (assistance: Assistance) => {
	return new Promise<Assistance[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_assistance bva ${INNERS_JOIN} where bva.id_assistance = ${assistance.id_assistance}`;

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

export const view_assistance_by_user_read = (assistance: Assistance) => {
	return new Promise<Assistance[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_assistance bva ${INNERS_JOIN} where bva.id_user = ${assistance.user}`;

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

export const view_assistance_by_course_read = (assistance: Assistance) => {
	return new Promise<Assistance[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_assistance bva ${INNERS_JOIN} where bva.id_course = ${assistance.course}`;

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

export const view_assistance_by_user_and_course_read = (
	assistance: Assistance
) => {
	return new Promise<Assistance[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_assistance bva ${INNERS_JOIN} where bva.id_user = ${assistance.user} and bva.id_course = ${assistance.course}`;

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

export const dml_assistance_update = (assistance: Assistance) => {
	return new Promise<Assistance[]>(async (resolve, reject) => {
		const query = `select * from business.dml_assistance_update_modified(${
			assistance.id_user_
		},
			${assistance.id_assistance},
			${assistance.user.id_user},
			${assistance.course.id_course},
			'${assistance.start_marking_date}',
			${
				assistance.end_marking_date == null
					? assistance.end_marking_date
					: `'${assistance.end_marking_date}'`
			},
			${assistance.is_late})`;

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

export const dml_assistance_delete = (assistance: Assistance) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_assistance_delete(${assistance.id_user_},${assistance.id_assistance}) as result`;

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
