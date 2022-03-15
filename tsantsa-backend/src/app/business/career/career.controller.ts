import { parseDateToString } from '../../../utils/date';
import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Career } from './career.class';

export const validation = (career: Career, url: string, token: string) => {
	return new Promise<Career | Career[] | boolean | any>(
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
								career.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_career',
								career.id_career,
								'number',
								5
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'name_career',
								career.name_career,
								'string',
								100
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'description_career',
								career.description_career,
								'string',
								1000
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'status_career',
								career.status_career,
								'boolean'
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'creation_date_career',
								career.creation_date_career,
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
							const _career = new Career();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_career.id_user_ = career.id_user_;
								await _career
									.create()
									.then((_career: Career) => {
										resolve(_career);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_career.name_career = career.name_career;
								await _career
									.read()
									.then((_careers: Career[]) => {
										resolve(_careers);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_career.id_career = career.id_career;
								await _career
									.specificRead()
									.then((_career: Career) => {
										resolve(_career);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_career.id_user_ = career.id_user_;
								_career.id_career = career.id_career;
								_career.company = career.company;
								_career.name_career = career.name_career;
								_career.description_career = career.description_career;
								_career.status_career = career.status_career;
								/**
								 * UTC -5
								 */
								_career.creation_date_career = parseDateToString(
									new Date(career.creation_date_career!)
								);
								await _career
									.update()
									.then((_career: Career) => {
										resolve(_career);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_career.id_user_ = career.id_user_;
								_career.id_career = career.id_career;
								await _career
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
