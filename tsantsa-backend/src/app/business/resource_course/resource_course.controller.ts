import fs from 'fs';
import path from 'path';
import { generateRandomNumber } from '../../../utils/global';
import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { ResourceCourse } from './resource_course.class';

export const validation = (
	resource_course: ResourceCourse,
	url: string,
	token: string
) => {
	return new Promise<ResourceCourse | ResourceCourse[] | boolean | any>(
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
						if (url == '/create') {
							attributeValidate(
								'id_user_',
								resource_course.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'file_name',
								resource_course.file_name,
								'string',
								250
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'length_mb',
								resource_course.length_mb,
								'string',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'extension',
								resource_course.extension,
								'string',
								10
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
								resource_course.course.id_course,
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
							const _resource_course = new ResourceCourse();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								const pathBase: string = `./file_store`;

								// Generate Path base
								if (!fs.existsSync(pathBase)) {
									fs.mkdir(pathBase, (error) => {
										if (error) {
											reject(`Ocurrió un error al crear la carpeta base`);
										}
									});
								}

								const pathResourceCourse: string = `./file_store/resource_course`;
								// Generate Path resource_course
								if (!fs.existsSync(pathResourceCourse)) {
									fs.mkdir(pathResourceCourse, (error) => {
										if (error) {
											reject(
												`Ocurrió un error al crear la carpeta resource_course`
											);
										}
									});
								}

								const pathInitialFile: string = `./${resource_course.file_name}${resource_course.extension}`;

								if (fs.existsSync(pathInitialFile)) {
									const pathFolder = `./file_store/resource_course/${resource_course.course.id_course}`;

									if (!fs.existsSync(pathFolder)) {
										fs.mkdir(pathFolder, (error) => {
											if (error) {
												reject(
													`Ocurrió un error al crear la carpeta ${pathFolder}`
												);
											}
										});
									}
									const nameFile = `${resource_course.file_name}_${
										resource_course.course.id_course
									}_${generateRandomNumber(6)}${resource_course.extension}`;

									const newPath: string = `${pathFolder}/${nameFile}`;

									fs.rename(pathInitialFile, newPath, async (err) => {
										if (err) {
											reject(
												`Ocurrió un error al guardar el archivo ${resource_course.file_name}`
											);
										} else {
											/** set required attributes for action */
											/** set required attributes for action */
											_resource_course.id_user_ = resource_course.id_user_;
											_resource_course.course = resource_course.course;
											_resource_course.file_name = resource_course.file_name;
											_resource_course.length_mb = resource_course.length_mb;
											_resource_course.extension = resource_course.extension;
											_resource_course.server_path = newPath;
											await _resource_course
												.create()
												.then((_resourceCourse: ResourceCourse) => {
													resolve(_resourceCourse);
												})
												.catch((error: any) => {
													reject(error);
												});
										}
									});
								} else {
									reject('No se recibio el archivo');
								}
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_resource_course.file_name = resource_course.file_name;
								_resource_course.course = resource_course.course;
								await _resource_course
									.read()
									.then((_resourceCourses: ResourceCourse[]) => {
										resolve(_resourceCourses);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_resource_course.id_resource_course =
									resource_course.id_resource_course;
								await _resource_course
									.specificRead()
									.then((_resourceCourse: ResourceCourse) => {
										resolve(_resourceCourse);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/byCourseRead') {
								/** set required attributes for action */
								_resource_course.course = resource_course.course;
								await _resource_course
									.byCourseRead()
									.then((_resourceCourses: ResourceCourse[]) => {
										resolve(_resourceCourses);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_resource_course.id_user_ = resource_course.id_user_;
								_resource_course.id_resource_course =
									resource_course.id_resource_course;
								await _resource_course
									.delete()
									.then((response: boolean) => {
										resolve(response);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/downloadFile') {
								/** set required attributes for action */
								_resource_course.server_path = resource_course.server_path;
								/**
								 * Armar el path final
								 */
								const pathFinal = `${path.resolve(
									'./'
								)}${_resource_course.server_path?.substring(
									1,
									_resource_course.server_path.length
								)}`;
								/**
								 * Si existe el comprobante segun el path, resolvemos el path Final
								 */
								if (fs.existsSync(pathFinal)) {
									resolve(pathFinal);
								} else {
									reject('No se encontro el recurso!');
								}
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
