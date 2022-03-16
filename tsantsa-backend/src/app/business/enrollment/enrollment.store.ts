import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Enrollment } from './enrollment.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bve.id_enrollment, bve.id_course, bve.id_user, bve.date_enrollment, bve.status_enrollment, bve.completed_course, bve.deleted_enrollment, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule, cvu.id_person, cvu.id_profile, cvu.type_user, cvu.name_user, cvu.password_user, cvu.avatar_user, cvu.status_user, cvp.id_academic, cvp.id_job, cvp.dni_person, cvp.name_person, cvp.last_name_person, cvp.address_person, cvp.phone_person`;
const INNERS_JOIN: string = ` inner join business.view_course bvc on bve.id_course = bvc.id_course
inner join business.view_period bvp on bvc.id_period = bvp.id_period
inner join business.view_career bvca on bvc.id_career = bvca.id_career
inner join business.view_schedule bvs on bvc.id_schedule = bvs.id_schedule
inner join core.view_user cvu on bve.id_user = cvu.id_user
inner join core.view_person cvp on cvu.id_person = cvp.id_person`;

export const dml_enrollment_create = (enrollment: Enrollment) => {
	return new Promise<Enrollment[]>(async (resolve, reject) => {
		const query = `select * from business.dml_enrollment_create_modified(${enrollment.id_user_}, ${enrollment.course.id_course}, ${enrollment.user.id_user})`;

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

export const view_enrollment = (enrollment: Enrollment) => {
	return new Promise<Enrollment[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_enrollment bve${INNERS_JOIN}${
			enrollment.course.toString() != 'query-all'
				? ` where lower(bvc.name_course) LIKE '%${enrollment.course.toString()}%'`
				: ``
		} order by bve.id_enrollment desc`;

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

export const view_enrollment_specific_read = (enrollment: Enrollment) => {
	return new Promise<Enrollment[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_enrollment bve ${INNERS_JOIN} where bve.id_enrollment = ${enrollment.id_enrollment}`;

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

export const view_enrollment_by_course_read = (enrollment: Enrollment) => {
	return new Promise<Enrollment[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_enrollment bve ${INNERS_JOIN} where bve.id_course = ${enrollment.course}`;

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

export const view_enrollment_by_user_read = (enrollment: Enrollment) => {
	return new Promise<Enrollment[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_enrollment bve ${INNERS_JOIN} where bve.id_user = ${enrollment.user} and bve.status_enrollment = true`;

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
export const dml_enrollment_update = (enrollment: Enrollment) => {
	return new Promise<Enrollment[]>(async (resolve, reject) => {
		const query = `select * from business.dml_enrollment_update_modified(${enrollment.id_user_},
			${enrollment.id_enrollment},
			${enrollment.course.id_course},
			${enrollment.user.id_user},
			'${enrollment.date_enrollment}',
			${enrollment.status_enrollment},
			${enrollment.completed_course},
			${enrollment.deleted_enrollment})`;

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

export const dml_enrollment_delete = (enrollment: Enrollment) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_enrollment_delete(${enrollment.id_user_},${enrollment.id_enrollment}) as result`;

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
