import { parseDateToString } from '../../../utils/date';
import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Enrollment } from './enrollment.class';

export const validation = (
	enrollment: Enrollment,
	url: string,
	token: string
) => {
	return new Promise<Enrollment | Enrollment[] | boolean | any>(
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
								enrollment.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_enrollment',
								enrollment.id_enrollment,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'date_enrollment',
								enrollment.date_enrollment,
								'string',
								30
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'status_enrollment',
								enrollment.status_enrollment,
								'boolean'
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'completed_course',
								enrollment.completed_course,
								'boolean'
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation course
						 */

						if (url == '/create' || url == '/update') {
							attributeValidate(
								'id_course',
								enrollment.course.id_course,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation user
						 */

						if (url == '/create' || url == '/update') {
							attributeValidate(
								'id_user',
								enrollment.user.id_user,
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
							const _enrollment = new Enrollment();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_enrollment.id_user_ = enrollment.id_user_;
								_enrollment.course = enrollment.course;
								_enrollment.user = enrollment.user;
								await _enrollment
									.create()
									.then((_enrollment: Enrollment) => {
										resolve(_enrollment);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_enrollment.course = enrollment.course;
								await _enrollment
									.read()
									.then((_enrollments: Enrollment[]) => {
										resolve(_enrollments);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_enrollment.id_enrollment = enrollment.id_enrollment;
								await _enrollment
									.specificRead()
									.then((_enrollment: Enrollment) => {
										resolve(_enrollment);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/byCourseRead') {
								/** set required attributes for action */
								_enrollment.course = enrollment.course;
								await _enrollment
									.byCourseRead()
									.then((_enrollment: Enrollment[]) => {
										resolve(_enrollment);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 11) == '/byUserRead') {
								/** set required attributes for action */
								_enrollment.user = enrollment.user;
								await _enrollment
									.byUserRead()
									.then((_enrollment: Enrollment[]) => {
										resolve(_enrollment);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_enrollment.id_user_ = enrollment.id_user_;
								_enrollment.id_enrollment = enrollment.id_enrollment;
								_enrollment.course = enrollment.course;
								_enrollment.user = enrollment.user;
								/**
								 * UTC -5
								 */
								_enrollment.date_enrollment = parseDateToString(
									new Date(enrollment.date_enrollment!)
								);
								_enrollment.date_enrollment = enrollment.date_enrollment;
								_enrollment.status_enrollment = enrollment.status_enrollment;
								_enrollment.completed_course = enrollment.completed_course;
								await _enrollment
									.update()
									.then((_enrollment: Enrollment) => {
										resolve(_enrollment);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_enrollment.id_user_ = enrollment.id_user_;
								_enrollment.id_enrollment = enrollment.id_enrollment;
								await _enrollment
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
