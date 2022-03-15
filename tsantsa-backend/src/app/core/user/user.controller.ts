import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { User } from './user.class';

let ID_COMPANY: string = '';

export const validation = (user: User, url: string, token: string) => {
	return new Promise<User | User[] | boolean | any>(async (resolve, reject) => {
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
						attributeValidate('id_user_', user.id_user_, 'number', 10).catch(
							(err) => {
								validationStatus = true;
								reject(err);
							}
						);
					}

					if (url == '/update') {
						attributeValidate('id_user', user.id_user, 'number', 10).catch(
							(err) => {
								validationStatus = true;
								reject(err);
							}
						);
					}

					if (url == '/update') {
						attributeValidate('type_user', user.type_user, 'string', 30).catch(
							(err) => {
								validationStatus = true;
								reject(err);
							}
						);
					}

					if (url == '/update') {
						attributeValidate('name_user', user.name_user, 'string', 50).catch(
							(err) => {
								validationStatus = true;
								reject(err);
							}
						);
					}

					if (url == '/update') {
						attributeValidate(
							'password_user',
							user.password_user,
							'string',
							250
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'avatar_user',
							user.avatar_user,
							'string',
							50
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate('status_user', user.status_user, 'boolean').catch(
							(err) => {
								validationStatus = true;
								reject(err);
							}
						);
					}

					/**
					 * Validation company
					 */

					if (url == '/update') {
						attributeValidate(
							'id_company',
							user.company.id_company,
							'number',
							5
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					/**
					 * Validation person
					 */

					if (url == '/update') {
						attributeValidate(
							'id_person',
							user.person.id_person,
							'number',
							10
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'id_academic',
							user.person.academic.id_academic,
							'number',
							10
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'title_academic',
							user.person.academic.title_academic,
							'string',
							250
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'abbreviation_academic',
							user.person.academic.abbreviation_academic,
							'string',
							50
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'nivel_academic',
							user.person.academic.nivel_academic,
							'string',
							100
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'id_job',
							user.person.job.id_job,
							'number',
							10
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'name_job',
							user.person.job.name_job,
							'string',
							200
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'address_job',
							user.person.job.address_job,
							'string',
							200
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'phone_job',
							user.person.job.phone_job,
							'string',
							13
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'position_job',
							user.person.job.position_job,
							'string',
							150
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'dni_person',
							user.person.dni_person,
							'string',
							20
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'name_person',
							user.person.name_person,
							'string',
							150
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'last_name_person',
							user.person.last_name_person,
							'string',
							150
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'address_person',
							user.person.address_person,
							'string',
							150
						).catch((err) => {
							validationStatus = true;
							reject(err);
						});
					}

					if (url == '/update') {
						attributeValidate(
							'phone_person',
							user.person.phone_person,
							'string',
							13
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
							user.profile.id_profile,
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
						const _user = new User();
						/**
						 * Execute the url depending on the path
						 */
						if (url == '/create') {
							/** set required attributes for action */
							_user.id_user_ = user.id_user_;
							await _user
								.create()
								.then((_user: User) => {
									resolve(_user);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url.substring(0, 5) == '/read') {
							/** set required attributes for action */
							_user.name_user = user.name_user;
							await _user
								.read(ID_COMPANY)
								.then((_users: User[]) => {
									resolve(_users);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url.substring(0, 13) == '/specificRead') {
							/** set required attributes for action */
							_user.id_user = user.id_user;
							await _user
								.specificRead(ID_COMPANY)
								.then((_user: User) => {
									resolve(_user);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url == '/update') {
							/** set required attributes for action */
							_user.id_user_ = user.id_user_;
							_user.id_user = user.id_user;
							_user.company = user.company;
							_user.person = user.person;
							_user.profile = user.profile;
							_user.type_user = user.type_user;
							_user.name_user = user.name_user;
							_user.password_user = user.password_user;
							_user.avatar_user = user.avatar_user;
							_user.status_user = user.status_user;
							await _user
								.update()
								.then((_user: User) => {
									resolve(_user);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url.substring(0, 7) == '/delete') {
							/** set required attributes for action */
							_user.id_user_ = user.id_user_;
							_user.id_user = user.id_user;
							await _user
								.delete()
								.then((response: boolean) => {
									resolve(response);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url == '/uploadAvatar') {
							/** set required attributes for action */
							_user.id_user = user.id_user;
							await _user
								.uploadAvatar()
								.then((response: any) => {
									resolve(response);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url == '/removeAvatar') {
							/** set required attributes for action */
							_user.id_user = user.id_user;
							await _user
								.removeAvatar()
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
	});
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
