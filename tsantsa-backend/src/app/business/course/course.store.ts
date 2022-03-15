import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { parseDateToString } from '../../../utils/date';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Course } from './course.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvc.id_course, bvc.id_company, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course, bvc.deleted_course, cvc.name_company, cvc.acronym_company, cvc.address_company, cvc.status_company, bvp.name_period, bvp.description_period, bvp.start_date_period, bvp.end_date_period, bvp.maximum_rating, bvp.approval_note_period, bvca.name_career, bvca.description_career, bvca.status_career, bvca.creation_date_career, bvs.start_date_schedule, bvs.end_date_schedule, bvs.tolerance_schedule, bvs.creation_date_schedule`;
const INNERS_JOIN: string = ` inner join core.view_company cvc on bvc.id_company = cvc.id_company
inner join business.view_period bvp on bvc.id_period = bvp.id_period
inner join business.view_career bvca on bvc.id_career = bvca.id_career
inner join business.view_schedule bvs  on bvc.id_schedule = bvs.id_schedule`;

export const dml_course_create = (course: Course) => {
	return new Promise<Course[]>(async (resolve, reject) => {
		const query = `select * from business.dml_course_create_modified(${course.id_user_})`;

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

export const view_course = (course: Course) => {
	return new Promise<Course[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_course bvc${INNERS_JOIN}${
			course.name_course != 'query-all'
				? ` where lower(bvc.name_course) LIKE '%${course.name_course}%'`
				: ``
		} order by bvc.id_course desc`;

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

export const view_course_specific_read = (course: Course) => {
	return new Promise<Course[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_course bvc ${INNERS_JOIN} where bvc.id_course = ${course.id_course}`;

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

export const dml_course_update = (course: Course) => {
	return new Promise<Course[]>(async (resolve, reject) => {
		const query = `select * from business.dml_course_update_modified(${
			course.id_user_
		},
			${course.id_course},
			${course.company.id_company},
			${course.period.id_period},
			${course.career.id_career},
			${course.schedule.id_schedule},
			'${course.name_course}',
			'${course.description_course}',
			${course.status_course},
			'${course.creation_date_course}',
			${course.deleted_course},
			'${course.schedule.start_date_schedule}',
			'${course.schedule.end_date_schedule}',
			${course.schedule.tolerance_schedule},
			'${parseDateToString(new Date(course.schedule.creation_date_schedule!))}')`;

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

export const dml_course_delete = (course: Course) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_course_delete_modified(${course.id_user_},${course.id_course}) as result`;

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
