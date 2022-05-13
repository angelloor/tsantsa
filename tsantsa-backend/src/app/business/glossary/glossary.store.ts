import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Glossary } from './glossary.class';
/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvg.id_glossary, bvg.id_course, bvg.term_glossary, bvg.concept_glossary, bvg.date_glossary, bvg.deleted_glossary, bvc.id_company, bvc.id_period, bvc.id_career, bvc.id_schedule, bvc.name_course, bvc.description_course, bvc.status_course, bvc.creation_date_course`;
const INNERS_JOIN: string = ` inner join business.view_course bvc on bvg.id_course = bvc.id_course`;

export const dml_glossary_create = (glossary: Glossary) => {
	return new Promise<Glossary[]>(async (resolve, reject) => {
		const query = `select * from business.dml_glossary_create_modified(${glossary.id_user_}, ${glossary.course.id_course})`;

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

export const view_glossary = (glossary: Glossary) => {
	return new Promise<Glossary[]>(async (resolve, reject) => {
		const course: any = glossary.course;

		const query = `select ${COLUMNS_RETURN} from business.view_glossary bvg${INNERS_JOIN}${
			glossary.term_glossary != 'query-all'
				? ` where lower(bvg.term_glossary) LIKE '%${glossary.term_glossary}%' ${
						course != '*' ? `and bvg.id_course = ${course}` : ''
				  }`
				: ` ${course != '*' ? `where bvg.id_course = ${course}` : ''}`
		} order by bvg.id_glossary desc`;

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

export const view_glossary_specific_read = (glossary: Glossary) => {
	return new Promise<Glossary[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_glossary bvg ${INNERS_JOIN} where bvg.id_glossary = ${glossary.id_glossary}`;

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

export const view_glossary_by_course_read = (glossary: Glossary) => {
	return new Promise<Glossary[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_glossary bvg ${INNERS_JOIN} where bvg.id_course = ${glossary.course}`;

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

export const dml_glossary_update = (glossary: Glossary) => {
	return new Promise<Glossary[]>(async (resolve, reject) => {
		const query = `select * from business.dml_glossary_update_modified(${glossary.id_user_},
			${glossary.id_glossary},
			${glossary.course.id_course},
			'${glossary.term_glossary}',
			'${glossary.concept_glossary}',
			'${glossary.date_glossary}',
			${glossary.deleted_glossary})`;

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

export const dml_glossary_delete = (glossary: Glossary) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_glossary_delete(${glossary.id_user_},${glossary.id_glossary}) as result`;

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
