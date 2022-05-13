import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Glossary } from './glossary.class';

export const validation = (glossary: Glossary, url: string, token: string) => {
	return new Promise<Glossary | Glossary[] | boolean | any>(
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
								glossary.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_glossary',
								glossary.id_glossary,
								'number',
								5
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'term_glossary',
								glossary.term_glossary,
								'string',
								100
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'concept_glossary',
								glossary.concept_glossary,
								'string',
								500
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'date_glossary',
								glossary.date_glossary,
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
								glossary.course.id_course,
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
							const _glossary = new Glossary();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_glossary.id_user_ = glossary.id_user_;
								_glossary.course = glossary.course;
								await _glossary
									.create()
									.then((_glossary: Glossary) => {
										resolve(_glossary);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_glossary.term_glossary = glossary.term_glossary;
								_glossary.course = glossary.course;
								await _glossary
									.read()
									.then((_glossarys: Glossary[]) => {
										resolve(_glossarys);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_glossary.id_glossary = glossary.id_glossary;
								await _glossary
									.specificRead()
									.then((_glossary: Glossary) => {
										resolve(_glossary);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/byCourseRead') {
								/** set required attributes for action */
								_glossary.course = glossary.course;
								await _glossary
									.byCourseRead()
									.then((_glossarys: Glossary[]) => {
										resolve(_glossarys);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_glossary.id_user_ = glossary.id_user_;
								_glossary.id_glossary = glossary.id_glossary;
								_glossary.course = glossary.course;
								_glossary.term_glossary = glossary.term_glossary;
								_glossary.concept_glossary = glossary.concept_glossary;
								_glossary.date_glossary = glossary.date_glossary;
								await _glossary
									.update()
									.then((_glossary: Glossary) => {
										resolve(_glossary);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_glossary.id_user_ = glossary.id_user_;
								_glossary.id_glossary = glossary.id_glossary;
								await _glossary
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
