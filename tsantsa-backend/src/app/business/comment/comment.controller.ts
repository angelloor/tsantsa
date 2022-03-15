import { parseDateToString } from '../../../utils/date';
import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Comment } from './comment.class';

export const validation = (comment: Comment, url: string, token: string) => {
	return new Promise<Comment | Comment[] | boolean | any>(
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
								comment.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_comment',
								comment.id_comment,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'value_comment',
								comment.value_comment,
								'string',
								250
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'date_comment',
								comment.date_comment,
								'string',
								30
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation userTask
						 */

						if (url == '/update') {
							attributeValidate(
								'id_user_task',
								comment.user_task.id_user_task,
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
							const _comment = new Comment();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_comment.id_user_ = comment.id_user_;
								_comment.user_task = comment.user_task;
								await _comment
									.create()
									.then((_comment: Comment) => {
										resolve(_comment);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_comment.value_comment = comment.value_comment;
								await _comment
									.read()
									.then((_comments: Comment[]) => {
										resolve(_comments);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_comment.id_comment = comment.id_comment;
								await _comment
									.specificRead()
									.then((_comment: Comment) => {
										resolve(_comment);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 15) == '/byUserTaskRead') {
								/** set required attributes for action */
								_comment.user_task = comment.user_task;
								await _comment
									.byUserTaskRead()
									.then((_comment: Comment[]) => {
										resolve(_comment);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_comment.id_user_ = comment.id_user_;
								_comment.id_comment = comment.id_comment;
								_comment.user_task = comment.user_task;
								_comment.user = comment.user;
								_comment.value_comment = comment.value_comment;
								/**
								 * UTC -5
								 */
								_comment.date_comment = parseDateToString(
									new Date(comment.date_comment!)
								);
								_comment.date_comment = comment.date_comment;
								await _comment
									.update()
									.then((_comment: Comment) => {
										resolve(_comment);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_comment.id_user_ = comment.id_user_;
								_comment.id_comment = comment.id_comment;
								await _comment
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
