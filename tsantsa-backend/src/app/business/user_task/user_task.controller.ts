import { parseDateToString } from '../../../utils/date';
import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { UserTask } from './user_task.class';

export const validation = (user_task: UserTask, url: string, token: string) => {
	return new Promise<UserTask | UserTask[] | boolean | any>(
		async (resolve, reject) => {
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
						if (url == '/create' || url == '/update') {
							attributeValidate(
								'id_user_',
								user_task.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_user_task',
								user_task.id_user_task,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'response_user_task',
								user_task.response_user_task,
								'string',
								500
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update' && user_task.shipping_date_user_task != null) {
							attributeValidate(
								'shipping_date_user_task',
								user_task.shipping_date_user_task,
								'string',
								30
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update' && user_task.qualification_user_task != null) {
							attributeValidate(
								'qualification_user_task',
								user_task.qualification_user_task,
								'number',
								3
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate('is_open', user_task.is_open, 'boolean').catch(
								(err) => {
									validationStatus = true;
									reject(err);
								}
							);
						}

						if (url == '/update') {
							attributeValidate(
								'is_dispatched',
								user_task.is_dispatched,
								'boolean'
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'is_qualified',
								user_task.is_qualified,
								'boolean'
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation task
						 */

						if (url == '/update') {
							attributeValidate(
								'id_task',
								user_task.task.id_task,
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
							const _user_task = new UserTask();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_user_task.id_user_ = user_task.id_user_;
								_user_task.user = user_task.user;
								_user_task.task = user_task.task;
								await _user_task
									.create()
									.then((_userTask: UserTask) => {
										resolve(_userTask);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_user_task.response_user_task = user_task.response_user_task;
								await _user_task
									.read()
									.then((_userTasks: UserTask[]) => {
										resolve(_userTasks);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_user_task.id_user_task = user_task.id_user_task;
								await _user_task
									.specificRead()
									.then((_userTask: UserTask) => {
										resolve(_userTask);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 11) == '/byUserRead') {
								/** set required attributes for action */
								_user_task.user = user_task.user;
								await _user_task
									.byUserRead()
									.then((_userTask: UserTask[]) => {
										resolve(_userTask);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 17) == '/bySenderUserRead') {
								/** set required attributes for action */
								_user_task.user = user_task.user;
								await _user_task
									.bySenderUserRead()
									.then((_userTask: UserTask[]) => {
										resolve(_userTask);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_user_task.id_user_ = user_task.id_user_;
								_user_task.id_user_task = user_task.id_user_task;
								_user_task.user = user_task.user;
								_user_task.task = user_task.task;
								_user_task.response_user_task = user_task.response_user_task;
								/**
								 * UTC -5
								 */
								if (
									user_task.shipping_date_user_task != null &&
									user_task.shipping_date_user_task != ''
								) {
									_user_task.shipping_date_user_task = parseDateToString(
										new Date(user_task.shipping_date_user_task!)
									);
								} else if (user_task.shipping_date_user_task == '') {
									_user_task.shipping_date_user_task = null!;
								}

								_user_task.qualification_user_task =
									user_task.qualification_user_task;
								_user_task.is_open = user_task.is_open;
								_user_task.is_dispatched = user_task.is_dispatched;
								_user_task.is_qualified = user_task.is_qualified;
								await _user_task
									.update()
									.then((_userTask: UserTask) => {
										resolve(_userTask);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_user_task.id_user_ = user_task.id_user_;
								_user_task.id_user_task = user_task.id_user_task;
								await _user_task
									.delete()
									.then((response: boolean) => {
										resolve(response);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 21) == '/reportUserTaskByUser') {
								_user_task.user = user_task.user;
								await _user_task
									.reportUserTaskByUser()
									.then((response: any) => {
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
		}
	);
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
