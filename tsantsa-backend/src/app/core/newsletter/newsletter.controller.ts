import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Newsletter } from './newsletter.class';

export const validation = (
	newsletter: Newsletter,
	url: string,
	token: string
) => {
	return new Promise<Newsletter | Newsletter[] | boolean | any>(
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
								newsletter.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_newsletter',
								newsletter.id_newsletter,
								'number',
								5
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'name_newsletter',
								newsletter.name_newsletter,
								'string',
								100
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'description_newsletter',
								newsletter.description_newsletter,
								'string',
								500
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
								newsletter.company.id_company,
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
							const _newsletter = new Newsletter();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_newsletter.id_user_ = newsletter.id_user_;
								_newsletter.company = newsletter.company;
								await _newsletter
									.create()
									.then((_newsletter: Newsletter) => {
										resolve(_newsletter);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_newsletter.name_newsletter = newsletter.name_newsletter;
								await _newsletter
									.read()
									.then((_newsletters: Newsletter[]) => {
										resolve(_newsletters);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_newsletter.id_newsletter = newsletter.id_newsletter;
								await _newsletter
									.specificRead()
									.then((_newsletter: Newsletter) => {
										resolve(_newsletter);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 14) == '/byCompanyRead') {
								/** set required attributes for action */
								_newsletter.company = newsletter.company;
								await _newsletter
									.byCompanyRead()
									.then((_newsletters: Newsletter[]) => {
										resolve(_newsletters);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_newsletter.id_user_ = newsletter.id_user_;
								_newsletter.id_newsletter = newsletter.id_newsletter;
								_newsletter.company = newsletter.company;
								_newsletter.name_newsletter = newsletter.name_newsletter;
								_newsletter.description_newsletter =
									newsletter.description_newsletter;
								_newsletter.date_newsletter = newsletter.date_newsletter;
								await _newsletter
									.update()
									.then((_newsletter: Newsletter) => {
										resolve(_newsletter);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_newsletter.id_user_ = newsletter.id_user_;
								_newsletter.id_newsletter = newsletter.id_newsletter;
								await _newsletter
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
