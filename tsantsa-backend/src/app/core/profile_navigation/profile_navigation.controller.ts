import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { ProfileNavigation } from './profile_navigation.class';

export const validation = (
	profile_navigation: ProfileNavigation,
	url: string,
	token: string
) => {
	return new Promise<ProfileNavigation | ProfileNavigation[] | boolean | any>(
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
								profile_navigation.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_profile_navigation',
								profile_navigation.id_profile_navigation,
								'number',
								5
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation profile
						 */

						if (url == '/update') {
							attributeValidate(
								'id_profile',
								profile_navigation.profile.id_profile,
								'number',
								5
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation navigation
						 */

						if (url == '/update') {
							attributeValidate(
								'id_navigation',
								profile_navigation.navigation.id_navigation,
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
							const _profile_navigation = new ProfileNavigation();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_profile_navigation.id_user_ = profile_navigation.id_user_;
								_profile_navigation.profile = profile_navigation.profile;
								await _profile_navigation
									.create()
									.then((_profileNavigation: ProfileNavigation) => {
										resolve(_profileNavigation);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 14) == '/byProfileRead') {
								/** set required attributes for action */
								_profile_navigation.profile = profile_navigation.profile;
								await _profile_navigation
									.byProfileRead()
									.then((_profileNavigations: ProfileNavigation[]) => {
										resolve(_profileNavigations);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_profile_navigation.id_profile_navigation =
									profile_navigation.id_profile_navigation;
								await _profile_navigation
									.specificRead()
									.then((_profileNavigation: ProfileNavigation) => {
										resolve(_profileNavigation);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_profile_navigation.id_user_ = profile_navigation.id_user_;
								_profile_navigation.id_profile_navigation =
									profile_navigation.id_profile_navigation;
								_profile_navigation.profile = profile_navigation.profile;
								_profile_navigation.navigation = profile_navigation.navigation;
								await _profile_navigation
									.update()
									.then((_profileNavigation: ProfileNavigation) => {
										resolve(_profileNavigation);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_profile_navigation.id_user_ = profile_navigation.id_user_;
								_profile_navigation.id_profile_navigation =
									profile_navigation.id_profile_navigation;
								await _profile_navigation
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
