import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { SystemEvent } from './system_event.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `vse.id_system_event, vse.id_user, vse.table_system_event, vse.row_system_event, vse.action_system_event, vse.date_system_event, vse.deleted_system_event, vu.id_company, vu.id_person, vu.id_profile, vu.type_user, vu.name_user, vu.password_user, vu.avatar_user, vu.status_user, vc.id_setting, vc.name_company, vc.status_company, vp.id_academic, vp.id_job, vp.dni_person, vp.name_person, vp.last_name_person, vp.address_person, vp.phone_person`;
const INNERS_JOIN: string = ` inner join core.view_user vu on vse.id_user = vu.id_user
inner join core.view_company vc on vu.id_company = vc.id_company
inner join core.view_person vp on vu.id_person = vp.id_person`;

export const view_system_event = (system_event: SystemEvent) => {
	return new Promise<SystemEvent[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_system_event vse${INNERS_JOIN}${
			system_event.table_system_event != 'query-all'
				? ` where lower(vse.table_system_event) LIKE '%${system_event.table_system_event}%'
					or lower(vse.action_system_event) LIKE '%${system_event.table_system_event}%'
					or lower(vp.name_person) LIKE '%${system_event.table_system_event}%'
					or lower(vp.last_name_person) LIKE '%${system_event.table_system_event}%'`
				: ``
		} order by vse.id_system_event desc`;

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

export const view_system_event_specific_read = (system_event: SystemEvent) => {
	return new Promise<SystemEvent[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from core.view_system_event vse ${INNERS_JOIN} where vse.id_system_event = ${system_event.id_system_event}`;

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
