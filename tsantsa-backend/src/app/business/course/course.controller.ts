import { parseDateToString } from '../../../utils/date';
import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Course } from './course.class';

export const validation = (course: Course, url: string, token: string) => {
	return new Promise<Course | Course[] | boolean | any>(
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
								course.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_course',
								course.id_course,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'name_course',
								course.name_course,
								'string',
								250
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'description_course',
								course.description_course,
								'string',
								250
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'status_course',
								course.status_course,
								'boolean'
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'creation_date_course',
								course.creation_date_course,
								'string',
								30
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation period
						 */

						if (url == '/update') {
							attributeValidate(
								'id_period',
								course.period.id_period,
								'number',
								5
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation career
						 */

						if (url == '/update') {
							attributeValidate(
								'id_career',
								course.career.id_career,
								'number',
								5
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation schedule
						 */

						if (url == '/update') {
							attributeValidate(
								'id_schedule',
								course.schedule.id_schedule,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'start_date_schedule',
								course.schedule.start_date_schedule,
								'string',
								30
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'end_date_schedule',
								course.schedule.end_date_schedule,
								'string',
								30
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'tolerance_schedule',
								course.schedule.tolerance_schedule,
								'number',
								4
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'creation_date_schedule',
								course.schedule.creation_date_schedule,
								'string',
								30
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
							const _course = new Course();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_course.id_user_ = course.id_user_;
								await _course
									.create()
									.then((_course: Course) => {
										resolve(_course);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_course.name_course = course.name_course;
								await _course
									.read()
									.then((_courses: Course[]) => {
										resolve(_courses);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_course.id_course = course.id_course;
								await _course
									.specificRead()
									.then((_course: Course) => {
										resolve(_course);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_course.id_user_ = course.id_user_;
								_course.id_course = course.id_course;
								_course.company = course.company;
								_course.period = course.period;
								_course.career = course.career;
								_course.schedule = course.schedule;
								_course.name_course = course.name_course;
								_course.description_course = course.description_course;
								_course.status_course = course.status_course;
								/**
								 * UTC -5
								 */
								_course.creation_date_course = parseDateToString(
									new Date(course.creation_date_course!)
								);
								await _course
									.update()
									.then((_course: Course) => {
										resolve(_course);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_course.id_user_ = course.id_user_;
								_course.id_course = course.id_course;
								await _course
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
