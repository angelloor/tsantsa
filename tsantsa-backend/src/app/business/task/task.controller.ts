import { parseDateToString } from '../../../utils/date';
import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Task } from './task.class';

export const validation = (task: Task, url: string, token: string) => {
	return new Promise<Task | Task[] | boolean | any>(async (resolve, reject) => {
		/**
		 * Capa de Autentificación con el token
		 */
		let validationStatus: boolean = false;

		if (token) {
			await verifyToken(token)
				.then(async () => {
					/**
					 * Capa de validaciones
					 */
					if (url == '/create' || url == '/update' || url == '/sendTask') {
						attributeValidate('id_user_', task.id_user_, 'number', 10).catch(
							(err) => {
								validationStatus = true;
								reject(err);
							}
						);
					}

					if (url == '/update' || url == '/sendTask') {
						attributeValidate('id_task', task.id_task, 'number', 10).catch(
							(err) => {
								validationStatus = true;
								reject(err);
							}
						);
					}

					if (url == '/update' || url == '/sendTask') {
						attributeValidate('name_task', task.name_task, 'string', 100).catch(
							(err) => {
								validationStatus = true;
								reject(err);
							}
						);
					}

					if (url == '/update' || url == '/sendTask') {
						attributeValidate(
							'description_task',
							task.description_task,
							'string',
							250
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update' || url == '/sendTask') {
						attributeValidate('status_task', task.status_task, 'boolean').catch(
							(err) => {
								validationStatus = true;
								reject(err);
							}
						);
					}

					if (url == '/update' || url == '/sendTask') {
						attributeValidate(
							'creation_date_task',
							task.creation_date_task,
							'string',
							30
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update' || url == '/sendTask') {
						attributeValidate(
							'limit_date',
							task.limit_date,
							'string',
							30
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					/**
					 * Validation course
					 */

					if (url == '/update') {
						attributeValidate(
							'id_course',
							task.course.id_course,
							'number',
							10
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					/**
					 * Continuar solo si no ocurrio errores en la validación
					 */
					if (!validationStatus) {
						/**
						 * Instance the class
						 */
						const _task = new Task();
						/**
						 * Execute the url depending on the path
						 */
						if (url == '/create') {
							/** set required attributes for action */
							_task.id_user_ = task.id_user_;
							_task.course = task.course;
							await _task
								.create()
								.then((_task: Task) => {
									resolve(_task);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url.substring(0, 5) == '/read') {
							/** set required attributes for action */
							_task.name_task = task.name_task;
							await _task
								.read()
								.then((_tasks: Task[]) => {
									resolve(_tasks);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url.substring(0, 13) == '/specificRead') {
							/** set required attributes for action */
							_task.id_task = task.id_task;
							await _task
								.specificRead()
								.then((_task: Task) => {
									resolve(_task);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url == '/update') {
							/** set required attributes for action */
							_task.id_user_ = task.id_user_;
							_task.id_task = task.id_task;
							_task.course = task.course;
							_task.name_task = task.name_task;
							_task.description_task = task.description_task;
							_task.status_task = task.status_task;
							/**
							 * UTC -5
							 */
							_task.creation_date_task = parseDateToString(
								new Date(task.creation_date_task!)
							);
							_task.limit_date = parseDateToString(new Date(task.limit_date!));
							await _task
								.update()
								.then((_task: Task) => {
									resolve(_task);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url == '/sendTask') {
							/** set required attributes for action */
							_task.id_user_ = task.id_user_;
							_task.id_task = task.id_task;
							_task.course = task.course;
							_task.name_task = task.name_task;
							_task.description_task = task.description_task;
							_task.status_task = task.status_task;
							/**
							 * UTC -5
							 */
							_task.creation_date_task = parseDateToString(
								new Date(task.creation_date_task!)
							);
							_task.limit_date = parseDateToString(new Date(task.limit_date!));
							await _task
								.sendTask()
								.then((_task: Task) => {
									resolve(_task);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url.substring(0, 7) == '/delete') {
							/** set required attributes for action */
							_task.id_user_ = task.id_user_;
							_task.id_task = task.id_task;
							await _task
								.delete()
								.then((response: boolean) => {
									resolve(response);
								})
								.catch((error: any) => {
									reject(error);
								});
						}
					}
				})
				.catch((error) => {
					reject(error);
				});
		} else {
			reject(_mensajes[5]);
		}
	});
};

/**
 * Función para validar un campo de acuerdo a los criterios ingresados
 * @param attribute nombre del atributo a validar
 * @param value valor a validar
 * @param type tipo de dato correcto del atributo (string, number, boolean, object)
 * @param length longitud correcta del atributo
 * @returns true || error
 */
const attributeValidate = (
	attribute: string,
	value: any,
	type: string,
	_length: number = 0
) => {
	return new Promise<Boolean>((resolve, reject) => {
		if (value != undefined || value != null) {
			if (typeof value == `${type}`) {
				if (typeof value == 'string' || typeof value == 'number') {
					if (value.toString().length > _length) {
						reject({
							..._mensajes[8],
							descripcion: _mensajes[8].descripcion
								.replace('_nombreCampo', `${attribute}`)
								.replace('_caracteresEsperados', `${_length}`),
						});
					} else {
						resolve(true);
					}
				} else {
					resolve(true);
				}
			} else {
				reject({
					..._mensajes[7],
					descripcion: _mensajes[7].descripcion
						.replace('_nombreCampo', `${attribute}`)
						.replace('_tipoEsperado', `${type}`),
				});
			}
		} else {
			reject({
				..._mensajes[6],
				descripcion: _mensajes[6].descripcion.replace(
					'_nombreCampo',
					`${attribute}`
				),
			});
		}
	});
};
