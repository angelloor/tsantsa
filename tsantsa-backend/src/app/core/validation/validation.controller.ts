import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Validation } from './validation.class';

let ID_COMPANY: string = '';

export const validation = (
	validation: Validation,
	url: string,
	token: string
) => {
	return new Promise<Validation | Validation[] | boolean | any>(
		async (resolve, reject) => {
			/**
			 * Capa de Autentificación con el token
			 */
			let validationStatus: boolean = false;

			if (token) {
				await verifyToken(token)
					.then(async (decoded: any) => {
						ID_COMPANY = decoded.company.id_company;
						/**
						 * Capa de validaciones
						 */
						if (url == '/create' || url == '/update') {
							attributeValidate(
								'id_user_',
								validation.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_validation',
								validation.id_validation,
								'number',
								5
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'status_validation',
								validation.status_validation,
								'boolean'
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'pattern_validation',
								validation.pattern_validation,
								'string',
								500
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'message_validation',
								validation.message_validation,
								'string',
								250
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation company
						 */

						if (url == '/update') {
							attributeValidate(
								'id_company',
								validation.company.id_company,
								'number',
								5
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
							const _validation = new Validation();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_validation.id_user_ = validation.id_user_;
								_validation.type_validation = validation.type_validation;
								await _validation
									.create()
									.then((_validation: Validation) => {
										resolve(_validation);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_validation.message_validation = validation.message_validation;
								await _validation
									.read(ID_COMPANY)
									.then((_validations: Validation[]) => {
										resolve(_validations);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 21) == '/byTypeValidationRead') {
								/** set required attributes for action */
								_validation.type_validation = validation.type_validation;
								await _validation
									.byTypeValidationRead(ID_COMPANY)
									.then((_validation: Validation) => {
										resolve(_validation);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_validation.id_validation = validation.id_validation;
								await _validation
									.specificRead(ID_COMPANY)
									.then((_validation: Validation) => {
										resolve(_validation);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_validation.id_user_ = validation.id_user_;
								_validation.id_validation = validation.id_validation;
								_validation.company = validation.company;
								_validation.type_validation = validation.type_validation;
								_validation.status_validation = validation.status_validation;
								_validation.pattern_validation = validation.pattern_validation;
								_validation.message_validation = validation.message_validation;
								await _validation
									.update()
									.then((_validation: Validation) => {
										resolve(_validation);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_validation.id_user_ = validation.id_user_;
								_validation.id_validation = validation.id_validation;
								await _validation
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
