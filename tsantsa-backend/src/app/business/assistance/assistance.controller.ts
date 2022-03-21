import { parseDateToString } from '../../../utils/date';
import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Assistance } from './assistance.class';

export const validation = (
	assistance: Assistance,
	url: string,
	token: string
) => {
	return new Promise<Assistance | Assistance[] | boolean | any>(
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
								assistance.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_assistance',
								assistance.id_assistance,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'start_marking_date',
								assistance.start_marking_date,
								'string',
								30
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate('is_late', assistance.is_late, 'boolean').catch(
								(err) => {
									validationStatus = true;
									reject(err);
								}
							);
						}

						/**
						 * Validation course
						 */

						if (url == '/update') {
							attributeValidate(
								'id_course',
								assistance.course.id_course,
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
							const _assistance = new Assistance();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_assistance.id_user_ = assistance.id_user_;
								_assistance.course = assistance.course;
								await _assistance
									.create()
									.then((_assistance: Assistance) => {
										resolve(_assistance);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_assistance.course = assistance.course;
								await _assistance
									.read()
									.then((_assistances: Assistance[]) => {
										resolve(_assistances);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_assistance.id_assistance = assistance.id_assistance;
								await _assistance
									.specificRead()
									.then((_assistance: Assistance) => {
										resolve(_assistance);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 11) == '/byUserRead') {
								/** set required attributes for action */
								_assistance.user = assistance.user;
								await _assistance
									.byUserRead()
									.then((_assistance: Assistance[]) => {
										resolve(_assistance);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/byCourseRead') {
								/** set required attributes for action */
								_assistance.course = assistance.course;
								await _assistance
									.byCourseRead()
									.then((_assistance: Assistance[]) => {
										resolve(_assistance);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 20) == '/byUserAndCourseRead') {
								/** set required attributes for action */
								_assistance.user = assistance.user;
								_assistance.course = assistance.course;
								await _assistance
									.byUserAndCourseRead()
									.then((_assistance: Assistance[]) => {
										resolve(_assistance);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_assistance.id_user_ = assistance.id_user_;
								_assistance.id_assistance = assistance.id_assistance;
								_assistance.user = assistance.user;
								_assistance.course = assistance.course;
								/**
								 * UTC -5
								 */
								_assistance.start_marking_date = parseDateToString(
									new Date(assistance.start_marking_date!)
								);

								if (assistance.end_marking_date != null) {
									_assistance.end_marking_date = parseDateToString(
										new Date(assistance.end_marking_date!)
									);
								} else {
									_assistance.end_marking_date = assistance.end_marking_date;
								}
								_assistance.is_late = assistance.is_late;
								await _assistance
									.update()
									.then((_assistance: Assistance) => {
										resolve(_assistance);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_assistance.id_user_ = assistance.id_user_;
								_assistance.id_assistance = assistance.id_assistance;
								await _assistance
									.delete()
									.then((response: boolean) => {
										resolve(response);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (
								url.substring(0, 32) == '/reportAssistanceByUserAndCourse'
							) {
								_assistance.user = assistance.user;
								_assistance.course = assistance.course;
								await _assistance
									.reportAssistanceByUserAndCourse()
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
