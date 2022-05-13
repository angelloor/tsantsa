import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { CommentForum } from './comment_forum.class';

export const validation = (
	comment_forum: CommentForum,
	url: string,
	token: string
) => {
	return new Promise<CommentForum | CommentForum[] | boolean | any>(
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
								comment_forum.id_user_,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'id_comment_forum',
								comment_forum.id_comment_forum,
								'number',
								10
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						if (url == '/update') {
							attributeValidate(
								'value_comment_forum',
								comment_forum.value_comment_forum,
								'string',
								250
							).catch((err) => {
								validationStatus = true;
								reject(err);
							});
						}

						/**
						 * Validation forum
						 */

						if (url == '/update') {
							attributeValidate(
								'id_forum',
								comment_forum.forum.id_forum,
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
							const _comment_forum = new CommentForum();
							/**
							 * Execute the url depending on the path
							 */
							if (url == '/create') {
								/** set required attributes for action */
								_comment_forum.id_user_ = comment_forum.id_user_;
								_comment_forum.forum = comment_forum.forum;
								await _comment_forum
									.create()
									.then((_commentForum: CommentForum) => {
										resolve(_commentForum);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 5) == '/read') {
								/** set required attributes for action */
								_comment_forum.value_comment_forum =
									comment_forum.value_comment_forum;
								await _comment_forum
									.read()
									.then((_commentForums: CommentForum[]) => {
										resolve(_commentForums);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 13) == '/specificRead') {
								/** set required attributes for action */
								_comment_forum.id_comment_forum =
									comment_forum.id_comment_forum;
								await _comment_forum
									.specificRead()
									.then((_commentForum: CommentForum) => {
										resolve(_commentForum);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 12) == '/byForumRead') {
								/** set required attributes for action */
								_comment_forum.forum = comment_forum.forum;
								await _comment_forum
									.byForumRead()
									.then((_commentForums: CommentForum[]) => {
										resolve(_commentForums);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url == '/update') {
								/** set required attributes for action */
								_comment_forum.id_user_ = comment_forum.id_user_;
								_comment_forum.id_comment_forum =
									comment_forum.id_comment_forum;
								_comment_forum.forum = comment_forum.forum;
								_comment_forum.value_comment_forum =
									comment_forum.value_comment_forum;
								await _comment_forum
									.update()
									.then((_commentForum: CommentForum) => {
										resolve(_commentForum);
									})
									.catch((error: any) => {
										reject(error);
									});
							} else if (url.substring(0, 7) == '/delete') {
								/** set required attributes for action */
								_comment_forum.id_user_ = comment_forum.id_user_;
								_comment_forum.id_comment_forum =
									comment_forum.id_comment_forum;
								await _comment_forum
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
