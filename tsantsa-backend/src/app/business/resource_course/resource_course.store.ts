import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { ResourceCourse } from './resource_course.class';
/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvrc.id_resource_course, bvrc.id_course, bvrc.id_user, bvrc.file_name, bvrc.length_mb, bvrc.extension, bvrc.server_path, bvrc.upload_date, bvc.id_company, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course`;
const INNERS_JOIN: string = ` inner join business.view_course bvc on bvrc.id_course = bvc.id_course`;

export const dml_resource_course_create = (resource_course: ResourceCourse) => {
	return new Promise<ResourceCourse[]>(async (resolve, reject) => {
		const query = `select * from business.dml_resource_course_create_modified(${resource_course.id_user_}, ${resource_course.course.id_course}, ${resource_course.id_user_}, '${resource_course.file_name}', '${resource_course.length_mb}', '${resource_course.extension}', '${resource_course.server_path}')`;

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

export const view_resource_course = (resource_course: ResourceCourse) => {
	return new Promise<ResourceCourse[]>(async (resolve, reject) => {
		const course: any = resource_course.course;

		const query = `select ${COLUMNS_RETURN} from business.view_resource_course bvrc${INNERS_JOIN}${
			resource_course.file_name != 'query-all'
				? ` where lower(bvrc.file_name) LIKE '%${resource_course.file_name}%' ${
						course != '*' ? `and bvrc.id_course = ${course}` : ''
				  }`
				: ` ${course != '*' ? `where bvrc.id_course = ${course}` : ''}`
		} order by bvrc.id_resource_course desc`;

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

export const view_resource_course_specific_read = (
	resource_course: ResourceCourse
) => {
	return new Promise<ResourceCourse[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_resource_course bvrc ${INNERS_JOIN} where bvrc.id_resource_course = ${resource_course.id_resource_course}`;

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

export const view_resource_course_by_course_read = (
	resource_course: ResourceCourse
) => {
	return new Promise<ResourceCourse[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_resource_course bvrc ${INNERS_JOIN} where bvrc.id_course = ${resource_course.course}`;

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

export const dml_resource_course_delete = (resource_course: ResourceCourse) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_resource_course_delete(${resource_course.id_user_},${resource_course.id_resource_course}) as result`;

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
