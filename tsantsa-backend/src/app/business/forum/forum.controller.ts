import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Forum } from './forum.class';

export const validation = (forum: Forum, url: string, token: string) => {
	return new Promise<Forum | Forum[] | boolean | any>(
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
							attributeValidate('id_user_', forum.id_user_, 'number', 10).catch(
								(err) => {
									validationStatus = true;
									reject(err);
								}
							);
						}

						if (url == '/update') {
							attributeValidate('id_forum', forum.id_forum, 'number', 5).catch(
								(err) => {
									validationStatus = true;
									reject(err);
								}
							);
						}

						if (url == '/update') {
							attributeValidate(
								'title_forum',
								forum.title_forum,
								'string',
								100
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'description_forum',
								forum.description_forum,
								'string',
								250
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'date_forum',
								forum.date_forum,
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
								forum.course.id_course,
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
							const _forum = new Forum();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_forum.id_user_ = forum.id_user_;
								_forum.course = forum.course;
								await _forum
									.create()
									.then((_forum: Forum) => {
										resolve(_forum);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_forum.title_forum = forum.title_forum;
								_forum.course = forum.course;
								await _forum
									.read()
									.then((_forums: Forum[]) => {
										resolve(_forums);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_forum.id_forum = forum.id_forum;
								await _forum
									.specificRead()
									.then((_forum: Forum) => {
										resolve(_forum);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/byCourseRead') {
								/** set required attributes for action */
								_forum.course = forum.course;
								await _forum
									.byCourseRead()
									.then((_forums: Forum[]) => {
										resolve(_forums);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_forum.id_user_ = forum.id_user_;
								_forum.id_forum = forum.id_forum;
								_forum.course = forum.course;
								_forum.user = forum.user;
								_forum.title_forum = forum.title_forum;
								_forum.description_forum = forum.description_forum;
								_forum.date_forum = forum.date_forum;
								await _forum
									.update()
									.then((_forum: Forum) => {
										resolve(_forum);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_forum.id_user_ = forum.id_user_;
								_forum.id_forum = forum.id_forum;
								await _forum
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
