import fs from 'fs';
import path from 'path';
import { generateRandomNumber } from '../../../utils/global';
import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Attached } from './attached.class';

export const validation = (attached: Attached, url: string, token: string) => {
	return new Promise<Attached | Attached[] | boolean | any>(
		async (resolve, reject) => {
			/**
			 * Capa de Autentificación con el token
			 */

			let validationStatus: boolean = false;

			if (token) {
				await verifyToken(token)
					.then(async () => {
						/**
						 * Continuar solo si no ocurrio errores en la validación
						 */
						if (!validationStatus) {
							/**
							 * Instance the class
							 */
							const _attached = new Attached();
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

								const pathUserTask: string = `./file_store/user_task`;
								// Generate Path user_task
								if (!fs.existsSync(pathUserTask)) {
									fs.mkdir(pathUserTask, (error) => {
										if (error) {
											reject(`Ocurrió un error al crear la carpeta user_task`);
										}
									});
								}

								const pathInitialFile: string = `./${attached.file_name}${attached.extension}`;

								if (fs.existsSync(pathInitialFile)) {
									const pathFolder = `./file_store/user_task/${attached.user_task.id_user_task}`;

									if (!fs.existsSync(pathFolder)) {
										fs.mkdir(pathFolder, (error) => {
											if (error) {
												reject(
													`Ocurrió un error al crear la carpeta ${pathFolder}`
												);
											}
										});
									}
									const nameFile = `${attached.file_name}_${
										attached.user_task.id_user_task
									}_${generateRandomNumber(6)}${attached.extension}`;

									const newPath: string = `${pathFolder}/${nameFile}`;

									fs.rename(pathInitialFile, newPath, async (err) => {
										if (err) {
											reject(
												`Ocurrió un error al guardar el archivo ${attached.file_name}`
											);
										} else {
											/** set required attributes for action */
											_attached.id_user_ = attached.id_user_;
											_attached.user_task = attached.user_task;
											_attached.file_name = attached.file_name;
											_attached.length_mb = attached.length_mb;
											_attached.extension = attached.extension;
											_attached.server_path = newPath;
											await _attached
												.create()
												.then((_attached: Attached) => {
													resolve(_attached);
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
								_attached.file_name = attached.file_name;
								await _attached
									.read()
									.then((_attacheds: Attached[]) => {
										resolve(_attacheds);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_attached.id_attached = attached.id_attached;
								await _attached
									.specificRead()
									.then((_attached: Attached) => {
										resolve(_attached);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 15) == '/byUserTaskRead') {
								/** set required attributes for action */
								_attached.user_task = attached.user_task;
								await _attached
									.byUserTaskRead()
									.then((_attached: Attached[]) => {
										resolve(_attached);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_attached.id_user_ = attached.id_user_;
								_attached.id_attached = attached.id_attached;

								/**
								 * Query properties for delete alfresco
								 */
								await _attached
									.specificRead()
									.then(async (attached: Attached) => {
										_attached.server_path = attached.server_path;

										await _attached
											.delete()
											.then((response: boolean) => {
												deleteFileStore(_attached.server_path!);
												resolve(response);
											})
											.catch((error: any) => {
												reject(error);
											});
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/downloadFile') {
								/** set required attributes for action */
								_attached.server_path = attached.server_path;

								/**
								 * Armar el path final
								 */
								const pathFinal = `${path.resolve(
									'./'
								)}${_attached.server_path?.substring(
									1,
									_attached.server_path.length
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

const deleteFileStore = (path: string) => {
	fs.unlink(path, (err) => {
		if (err) {
			console.error(err);
		}
	});
};
