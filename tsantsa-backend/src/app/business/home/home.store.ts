import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Home } from './home.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `(select count(*) from business.view_career bvc) as total_career, (select count(*) from business.view_career bvc where bvc.status_career = true) as total_career_activated, (select count(*) from business.view_course bvco) as total_course, (select count(*) from business.view_course bvco where bvco.status_course = true) as total_course_activated, (select count(*) from business.view_task bvt) as total_task, (select count(*) from business.view_task bvt where bvt.status_task = true) as total_task_sent, (select count(*) from core.view_user cvu) as total_user, (select count(*) from core.view_user cvu where cvu.status_user = true) as total_user_activated `;

export const view_home = () => {
	return new Promise<Home | any>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN}`;

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

export const view_details = () => {
	return new Promise<Home | any>(async (resolve, reject) => {
		const query = `select bvpe.id_period, bvpe.name_period,
		(select count(bve.id_user) from business.view_enrollment bve 
		inner join business.view_course bvc on bve.id_course = bvc.id_course
		inner join business.view_period bvp on bvc.id_period = bvp.id_period
		where  bvp.id_period = bvpe.id_period) as students, 
		(select count(*) from core.view_user cvu where cvu.type_user = 'teacher') as teachers,
		(select count(*) from business.view_course bvc where bvc.id_period = bvpe.id_period) as  courses,
		(select count(*) from business.view_task bvt
		inner join business.view_course bvc on bvt.id_course = bvc.id_course
		where bvc.id_period = bvpe.id_period) as tasks,
		''||bvpe.approval_note_period||'/'||bvpe.maximum_rating||''::character varying as approval_note_period
		from business.view_period bvpe`;

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
