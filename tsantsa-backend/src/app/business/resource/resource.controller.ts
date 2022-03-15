import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Resource } from './resource.class';

export const validation = (resource: Resource, url: string, token: string) => {
	return new Promise<Resource | Resource[] | boolean | any>(
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
								resource.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_resource',
								resource.id_resource,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'name_resource',
								resource.name_resource,
								'string',
								100
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'description_resource',
								resource.description_resource,
								'string',
								250
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'link_resource',
								resource.link_resource,
								'string',
								500
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation task
						 */

						if (url == '/update') {
							attributeValidate(
								'id_task',
								resource.task.id_task,
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
							const _resource = new Resource();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_resource.id_user_ = resource.id_user_;
								_resource.task = resource.task;
								await _resource
									.create()
									.then((_resource: Resource) => {
										resolve(_resource);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_resource.name_resource = resource.name_resource;
								await _resource
									.read()
									.then((_resources: Resource[]) => {
										resolve(_resources);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_resource.id_resource = resource.id_resource;
								await _resource
									.specificRead()
									.then((_resource: Resource) => {
										resolve(_resource);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 11) == '/byTaskRead') {
								/** set required attributes for action */
								_resource.task = resource.task;
								await _resource
									.byTaskRead()
									.then((_resource: Resource[]) => {
										resolve(_resource);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_resource.id_user_ = resource.id_user_;
								_resource.id_resource = resource.id_resource;
								_resource.task = resource.task;
								_resource.name_resource = resource.name_resource;
								_resource.description_resource = resource.description_resource;
								_resource.link_resource = resource.link_resource;
								await _resource
									.update()
									.then((_resource: Resource) => {
										resolve(_resource);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_resource.id_user_ = resource.id_user_;
								_resource.id_resource = resource.id_resource;
								await _resource
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
