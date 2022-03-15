import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Session } from './session.class';

let ID_COMPANY: string = '';

export const validation = (session: Session, url: string, token: string) => {
	return new Promise<Session | Session[] | boolean | any>(
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
						if (
							url == '/bySessionRelease' ||
							url == '/byUserReleaseAll' ||
							url == '/byCompanyReleaseAll'
						) {
							attributeValidate(
								'id_user_',
								session.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/bySessionRelease') {
							attributeValidate(
								'id_session',
								session.id_session,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/byUserReleaseAll') {
							attributeValidate(
								'id_user',
								session.user.id_user,
								'number',
								5
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/byCompanyReleaseAll') {
							attributeValidate(
								'id_company',
								session.user.company.id_company,
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
							const _session = new Session();
							/**
							 * Execute the url depending on the path
							 */
							if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_session.host_session = session.host_session;
								await _session
									.read(ID_COMPANY)
									.then((_sessions: Session[]) => {
										resolve(_sessions);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_session.id_session = session.id_session;
								await _session
									.specificRead(ID_COMPANY)
									.then((_session: Session) => {
										resolve(_session);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 11) == '/byUserRead') {
								/** set required attributes for action */
								_session.user = session.user;
								await _session
									.byUserRead(ID_COMPANY)
									.then((_session: Session[]) => {
										resolve(_session);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/bySessionRelease') {
								/** set required attributes for action */
								_session.id_user_ = session.id_user_;
								_session.id_session = session.id_session;
								await _session
									.bySessionRelease()
									.then((_session: Session) => {
										resolve(_session);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/byUserReleaseAll') {
								/** set required attributes for action */
								_session.id_user_ = session.id_user_;
								_session.user = session.user;
								await _session
									.byUserReleaseAll()
									.then((response: boolean) => {
										resolve(response);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/byCompanyReleaseAll') {
								/** set required attributes for action */
								_session.id_user_ = session.id_user_;
								_session.user.company = session.user.company;
								await _session
									.byCompanyReleaseAll()
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
