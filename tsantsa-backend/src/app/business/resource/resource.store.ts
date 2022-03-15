import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Resource } from './resource.class';

/**
 * Inners and columns for the resolution of ids
 */
const COLUMNS_RETURN: string = `bvr.id_resource, bvr.id_task, bvr.name_resource, bvr.description_resource, bvr.link_resource, bvr.deleted_resource, bvt.name_task, bvt.description_task, bvt.status_task, bvt.creation_date_task, bvt.limit_date`;
const INNERS_JOIN: string = ` inner join business.view_task bvt on bvr.id_task = bvt.id_task`;

export const dml_resource_create = (resource: Resource) => {
	return new Promise<Resource[]>(async (resolve, reject) => {
		const query = `select * from business.dml_resource_create_modified(${resource.id_user_}, ${resource.task.id_task})`;

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

export const view_resource = (resource: Resource) => {
	return new Promise<Resource[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_resource bvr${INNERS_JOIN}${
			resource.name_resource != 'query-all'
				? ` where lower(bvr.name_resource) LIKE '%${resource.name_resource}%'`
				: ``
		} order by bvr.id_resource desc`;

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

export const view_resource_specific_read = (resource: Resource) => {
	return new Promise<Resource[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_resource bvr ${INNERS_JOIN} where bvr.id_resource = ${resource.id_resource}`;

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

export const view_resource_by_task_read = (resource: Resource) => {
	return new Promise<Resource[]>(async (resolve, reject) => {
		const query = `select ${COLUMNS_RETURN} from business.view_resource bvr ${INNERS_JOIN} where bvr.id_task = ${resource.task}`;

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

export const dml_resource_update = (resource: Resource) => {
	return new Promise<Resource[]>(async (resolve, reject) => {
		const query = `select * from business.dml_resource_update_modified(${resource.id_user_},
			${resource.id_resource},
			${resource.task.id_task},
			'${resource.name_resource}',
			'${resource.description_resource}',
			'${resource.link_resource}',
			${resource.deleted_resource})`;

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

export const dml_resource_delete = (resource: Resource) => {
	return new Promise<boolean>(async (resolve, reject) => {
		const query = `select * from business.dml_resource_delete(${resource.id_user_},${resource.id_resource}) as result`;

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
