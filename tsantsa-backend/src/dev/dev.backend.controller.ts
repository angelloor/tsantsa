import fs from 'fs';
import path from 'path';
import { utils_get_columns_backend, utils_table_exists } from './dev.store';
import { BodyBackendGenerate } from './utils/dev.types';
import {
	entityToUpperCase,
	entityToUpperCaseOutInitial,
} from './utils/dev.utils';

export const entityBackendGenerate = (body: BodyBackendGenerate) => {
	return new Promise<string>((resolve, reject) => {
		utils_table_exists(body.scheme, body.entity)
			.then(async (count) => {
				if (count == 1) {
					const basePath = path.join(__dirname, '../');
					let columns: [];
					let externasTables: [];
					/**
					 * Generate folder for the entity
					 */
					generateFolder(basePath, body.scheme, body.entity);
					/**
					 * Get columns of the entity
					 */

					await utils_get_columns_backend(body.scheme, body.entity)
						.then(async (columnsEntity) => {
							columns = columnsEntity;

							await generateTablesExternal(
								body.scheme,
								body.entity,
								columnsEntity
							)
								.then((_externasTables: any) => {
									externasTables = _externasTables;
								})
								.catch((error) => {
									reject(error);
								});

							generateRestServices(
								basePath,
								body.scheme,
								body.entity,
								columns,
								externasTables
							);

							generateEntityClass(basePath, body.scheme, body.entity, columns);

							generateEntityStore(
								basePath,
								body.scheme,
								body.entity,
								columns,
								body.attributeToQuery,
								externasTables
							);

							generateEntityController(
								basePath,
								body.scheme,
								body.entity,
								columns,
								body.attributeToQuery,
								externasTables
							).catch((error) => {
								reject(error);
							});

							generateData(basePath, body.scheme, body.entity);
						})
						.catch((error) => {
							reject(error);
						});
					/**
					 * Generate files
					 */
					generateEntityNetwork(
						basePath,
						body.scheme,
						body.entity,
						body.attributeToQuery
					);
					generateRouter(basePath, body.scheme, body.entity);
					resolve('Entidad Generada!');
				} else {
					reject('La entidad no existe en la base de datos');
				}
			})
			.catch((error) => {
				reject(error);
			});
	});
};

const generateTablesExternal = (
	scheme: string,
	entity: string,
	columnsEntity: []
) => {
	return new Promise((resolve, reject) => {
		let externalTables: string[] = [];
		let _externalTables: string[] = [];

		columnsEntity.map(async (item: any) => {
			if (
				item.column_name_ != `id_${entity}` &&
				item.column_name_.substring(0, 3) == 'id_'
			) {
				const table: string = item.column_name_.substring(
					3,
					item.column_name_.length
				);
				externalTables.push(table);
			}
		});

		if (externalTables.length != 0) {
			externalTables.map(async (item: any, index: number) => {
				await utils_get_columns_backend(scheme, item)
					.then((response) => {
						_externalTables.push(response);
						if (index + 1 == externalTables.length) {
							resolve(_externalTables);
						}
					})
					.catch((error) => {
						reject(error);
					});
			});
		} else {
			resolve([]);
		}
	});
};

const generateFolder = (basePath: string, scheme: string, entity: string) => {
	const dir = `${basePath}/app/${scheme}/${entity}`;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
};

const generateEntityClass = (
	basePath: string,
	scheme: string,
	entity: string,
	columns: []
) => {
	const dir = `${basePath}/app/${scheme}/${entity}/${entity}.class.ts`;
	let imports = ``;
	let attributes = ``;
	let constructor = ``;
	let settersAndGetters = ``;
	let initializer = ``;
	let havedTablesExternal: boolean = false;

	columns.map((item: any) => {
		if (
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
		) {
			havedTablesExternal = true;
		}
		imports += `${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? `import { ${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.length)
				  )} } from '../${item.column_name_.substring(
						3,
						item.column_name_.length
				  )}/${item.column_name_.substring(3, item.column_name_.length)}.class';
				   import { _${entityToUpperCaseOutInitial(
							item.column_name_.substring(3, item.column_name_.length)
						)} } from '../${item.column_name_.substring(
						3,
						item.column_name_.length
				  )}/${item.column_name_.substring(3, item.column_name_.length)}.data';`
				: ''
		}`;

		attributes += `public ${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? item.column_name_.substring(3, item.column_name_.lenght)
				: item.column_name_
		}${item.column_name_.substring(0, 3) != `id_` ? '?' : ''}:${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? `${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.lenght)
				  )}`
				: `${
						item.column_type_ == 'numeric'
							? 'number'
							: item.column_type_ == 'boolean'
							? 'boolean'
							: 'string'
				  }`
		};`;
		constructor += `${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? item.column_name_.substring(3, item.column_name_.lenght)
				: item.column_name_
		}:${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? `${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.lenght)
				  )}`
				: `${
						item.column_type_ == 'numeric'
							? 'number'
							: item.column_type_ == 'boolean'
							? 'boolean'
							: 'string'
				  }`
		} = ${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? `_${entityToUpperCaseOutInitial(
						item.column_name_.substring(3, item.column_name_.lenght)
				  )}`
				: `${
						item.column_type_ == 'numeric'
							? 0
							: item.column_type_ == 'boolean'
							? false
							: '""'
				  }`
		},`;
		settersAndGetters += `
		set _${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? item.column_name_.substring(3, item.column_name_.lenght)
				: item.column_name_
		}(${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? item.column_name_.substring(3, item.column_name_.lenght)
				: item.column_name_
		}: ${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? `${entityToUpperCase(
						item.column_name_.substring(3, item.column_name_.lenght)
				  )}`
				: `${
						item.column_type_ == 'numeric'
							? 'number'
							: item.column_type_ == 'boolean'
							? 'boolean'
							: 'string'
				  }`
		}) {
			this.${
				item.column_name_.substring(0, 3) == `id_` &&
				item.column_name_ != `id_${entity}`
					? item.column_name_.substring(3, item.column_name_.lenght)
					: item.column_name_
			} = ${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? item.column_name_.substring(3, item.column_name_.lenght)
				: item.column_name_
		};
		}
		get _${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? item.column_name_.substring(3, item.column_name_.lenght)
				: item.column_name_
		}() {
			return this.${
				item.column_name_.substring(0, 3) == `id_` &&
				item.column_name_ != `id_${entity}`
					? item.column_name_.substring(3, item.column_name_.lenght)
					: item.column_name_
			}${item.column_name_.substring(0, 3) != `id_` ? '!' : ''};
		}
		`;

		initializer += `this.${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? item.column_name_.substring(3, item.column_name_.lenght)
				: item.column_name_
		} = ${
			item.column_name_.substring(0, 3) == `id_` &&
			item.column_name_ != `id_${entity}`
				? item.column_name_.substring(3, item.column_name_.lenght)
				: item.column_name_
		};`;
	});

	attributes = `public id_user_?: number; ${attributes}`;
	constructor = `id_user_: number = 0, ${constructor}`;
	initializer = `this.id_user_ = id_user_; ${initializer}`;

	const classContent = `
${imports}
import {
	dml_${entity}_create,
	dml_${entity}_delete,
	dml_${entity}_update,
	view_${entity},
	view_${entity}_specific_read
} from './${entity}.store';

export class ${entityToUpperCase(entity)} {
	/** Attributes */
	${attributes}
	/** Constructor */
	constructor(
		${constructor}
	) {
		${initializer}
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}
	
	${settersAndGetters}
	/** Methods */
	create() {
		return new Promise<${entityToUpperCase(entity)}>(async (resolve, reject) => {
			await dml_${entity}_create(this)
				.then((${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}[]) => {
					${
						havedTablesExternal
							? `/**
								* Mutate response
								*/
								const _${entityToUpperCaseOutInitial(
									entity
								)}s = this.mutateResponse(${entityToUpperCaseOutInitial(
									entity
							  )}s);`
							: ''
					}

					resolve(${
						havedTablesExternal
							? `_${entityToUpperCaseOutInitial(entity)}s[0]`
							: `${entityToUpperCaseOutInitial(entity)}s[0] `
					});
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<${entityToUpperCase(entity)}[]>(async (resolve, reject) => {
			await view_${entity}(this)
				.then((${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}[]) => {
		${
			havedTablesExternal
				? `/**
					* Mutate response
					*/
					const _${entityToUpperCaseOutInitial(
						entity
					)}s = this.mutateResponse(${entityToUpperCaseOutInitial(entity)}s);`
				: ''
		}

		resolve(${
			havedTablesExternal
				? `_${entityToUpperCaseOutInitial(entity)}s`
				: `${entityToUpperCaseOutInitial(entity)}s `
		});
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<${entityToUpperCase(entity)}>(async (resolve, reject) => {
			await view_${entity}_specific_read(this)
				.then((${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}[]) => {
		${
			havedTablesExternal
				? `/**
					* Mutate response
					*/
					const _${entityToUpperCaseOutInitial(
						entity
					)}s = this.mutateResponse(${entityToUpperCaseOutInitial(entity)}s);`
				: ''
		}

		resolve(${
			havedTablesExternal
				? `_${entityToUpperCaseOutInitial(entity)}s[0]`
				: `${entityToUpperCaseOutInitial(entity)}s[0] `
		});
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<${entityToUpperCase(entity)}>(async (resolve, reject) => {
			await dml_${entity}_update(this)
				.then((${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}[]) => {
		${
			havedTablesExternal
				? `/**
					* Mutate response
					*/
					const _${entityToUpperCaseOutInitial(
						entity
					)}s = this.mutateResponse(${entityToUpperCaseOutInitial(entity)}s);`
				: ''
		}

		resolve(${
			havedTablesExternal
				? `_${entityToUpperCaseOutInitial(entity)}s[0]`
				: `${entityToUpperCaseOutInitial(entity)}s[0] `
		});
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_${entity}_delete(this)
				.then((response: boolean) => {
					resolve(response);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	${
		havedTablesExternal
			? `
			/**
			 * Eliminar ids de entidades externas y formatear la informacion en el esquema correspondiente
			 * @param ${entityToUpperCaseOutInitial(entity)}s
			 * @returns
			 */
			private mutateResponse(${entityToUpperCaseOutInitial(
				entity
			)}s: ${entityToUpperCase(entity)}[]): ${entityToUpperCase(entity)}[] {
				let _${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
					entity
			  )}[] = [];
		
				${entityToUpperCaseOutInitial(entity)}s.map((item: any) => {
					let _${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
					entity
			  )} | any = {
						...item,
						/**
						 * Generate structure of second level the entity (is important add the ids of entity)
						 * similar the return of read
						 */
					};
					/**
					 * delete ids of principal object level
					 */
					delete _${entityToUpperCaseOutInitial(entity)}.id_preparacion_academica;
		
					_${entityToUpperCaseOutInitial(entity)}s.push(_${entityToUpperCaseOutInitial(
					entity
			  )});
				});
		
				return _${entityToUpperCaseOutInitial(entity)}s;
			}
	`
			: ''
	}
	
}`;
	if (!fs.existsSync(dir)) {
		fs.writeFileSync(dir, `${classContent}`);
	}
};

const generateEntityController = (
	basePath: string,
	scheme: string,
	entity: string,
	columns: [],
	attributeToQuery: string,
	externasTables: []
) => {
	return new Promise((resolve, reject) => {
		const dir = `${basePath}/app/${scheme}/${entity}/${entity}.controller.ts`;
		let instaceAttributes = ``;
		/**
		 * Inicializar la capa de validaciones con la validacion de id_user_
		 */
		let validationCap = `if (url =='/create' || url =='/update') {
			attributeValidate(
				'id_user_',
				${entity}.id_user_,
				'number',
				10
			).catch((err) => {
				validationStatus = true;
				reject(err);
			});
		}
	`;

		let validationCapExternalTables: string = '';

		columns.map((item: any) => {
			instaceAttributes +=
				item.column_name_ == `deleted_${entity}`
					? ''
					: item.column_name_.substring(0, 3) == `id_` &&
					  item.column_name_ != `id_${entity}`
					? `_${entity}.${item.column_name_.substring(
							3,
							item.column_name_.length
					  )} = ${entity}.${item.column_name_.substring(
							3,
							item.column_name_.length
					  )};`
					: `_${entity}.${item.column_name_} = ${entity}.${item.column_name_};`;

			if (item.column_name_ == `id_${entity}`) {
				let type = '';
				let length = 0;
				if (item.column_type_ == 'character varying') {
					type = 'string';
					length = item.length_character_;
				} else if (item.column_type_ == 'numeric') {
					type = 'number';
					length = item.lenght_numeric_;
				} else {
					type = item.column_type_;
				}

				validationCap += `
			if (url =='/update') {
				attributeValidate('id_${entity}', ${entity}.id_${entity}, '${type}' ${
					item.column_type_ == 'character varying' ||
					item.column_type_ == 'numeric'
						? `, ${length}`
						: ''
				}).catch(
					(err) => {
						validationStatus = true;
						reject(err);
					}
				);
			}
			`;
			} else if (
				item.column_name_ != `deleted_${entity}` &&
				item.column_name_.substring(0, 3) != 'id_'
			) {
				let type = '';
				let length = 0;
				if (item.column_type_ == 'character varying') {
					type = 'string';
					length = item.length_character_;
				} else if (item.column_type_ == 'numeric') {
					type = 'number';
					length = item.lenght_numeric_;
				} else {
					type = item.column_type_;
				}

				validationCap += `
			if (url =='/update') {
				attributeValidate('${item.column_name_}', ${entity}.${
					item.column_name_
				}, '${type}' ${
					item.column_type_ == 'character varying' ||
					item.column_type_ == 'numeric'
						? `, ${length}`
						: ''
				}).catch(
					(err) => {
						validationStatus = true;
						reject(err);
					}
				);
			}
			`;
			}
		});
		instaceAttributes = `_${entity}.id_user_ = ${entity}.id_user_; ${instaceAttributes}`;

		externasTables.map((itemTable: any[], index: number) => {
			if (itemTable.length > 0) {
				let nameId = itemTable[0].column_name_;

				let nameTable = nameId.substring(3, nameId.length);

				validationCapExternalTables += `
			/**
			 * Validation ${entityToUpperCaseOutInitial(nameTable)}
			 */
			`;
				itemTable.map((item: any) => {
					if (item.column_name_ == `id_${entity}`) {
						let type = '';
						let length = 0;
						if (item.column_type_ == 'character varying') {
							type = 'string';
							length = item.length_character_;
						} else if (item.column_type_ == 'numeric') {
							type = 'number';
							length = item.lenght_numeric_;
						} else {
							type = item.column_type_;
						}

						validationCapExternalTables += `
				if (url =='/update') {
					attributeValidate('id_${entity}', ${entity}.${nameTable}.id_${entity}, '${type}' ${
							item.column_type_ == 'character varying' ||
							item.column_type_ == 'numeric'
								? `, ${length}`
								: ''
						}).catch(
						(err) => {
							validationStatus = true;
							reject(err);
						}
					);
				}
				`;
					} else if (item.column_name_ != `deleted_${nameTable}`) {
						let type = '';
						let length = 0;
						if (item.column_type_ == 'character varying') {
							type = 'string';
							length = item.length_character_;
						} else if (item.column_type_ == 'numeric') {
							type = 'number';
							length = item.lenght_numeric_;
						} else {
							type = item.column_type_;
						}

						validationCapExternalTables += `
				if (url =='/update') {
					attributeValidate('${item.column_name_}', ${entity}.${nameTable}.${
							item.column_name_
						}, '${type}' ${
							item.column_type_ == 'character varying' ||
							item.column_type_ == 'numeric'
								? `, ${length}`
								: ''
						}).catch(
						(err) => {
							validationStatus = true;
							reject(err);
						}
					);
				}
				`;
					}
				});
			}
		});

		const classContent = `
import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { ${entityToUpperCase(entity)} } from './${entity}.class';

export const validation = (${entity}: ${entityToUpperCase(
			entity
		)}, url: string, token: string) => {
	return new Promise<${entityToUpperCase(entity)} | ${entityToUpperCase(
			entity
		)}[] | boolean | any>(async (resolve, reject) => {
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
					${validationCap}
					${validationCapExternalTables}
					/**
					 * Continuar solo si no ocurrio errores en la validación
					 */
					if (!validationStatus) {
						/**
						 * Instance the class
						 */
						const _${entity} = new ${entityToUpperCase(entity)}();
						/**
						 * Execute the url depending on the path
						 */
						if (url =='/create') {
							/** set required attributes for action */ 
							_${entity}.id_user_ = ${entity}.id_user_;
							await _${entity}
								.create()
								.then((_${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
			entity
		)}) => {
									resolve(_${entityToUpperCaseOutInitial(entity)});
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url.substring(0, 5) =='/read') {
							/** set required attributes for action */ 
							_${entity}.${attributeToQuery} = ${entity}.${attributeToQuery};
							await _${entity}
								.read()
								.then((_${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
			entity
		)}[]) => {
									resolve(_${entityToUpperCaseOutInitial(entity)}s);
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url.substring(0, 13) == '/specificRead') {
							/** set required attributes for action */ 
							_${entity}.id_${entity} = ${entity}.id_${entity};
							await _${entity}
								.specificRead()
								.then((_${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
			entity
		)}) => {
									resolve(_${entityToUpperCaseOutInitial(entity)});
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url =='/update') {
							/** set required attributes for action */ 
							${instaceAttributes}
							await _${entity}
								.update()
								.then((_${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
			entity
		)}) => {
									resolve(_${entityToUpperCaseOutInitial(entity)});
								})
								.catch((error: any) => {
									reject(error);
								});
						} else if (url.substring(0, 7) =='/delete') {
							/** set required attributes for action */ 
							_${entity}.id_user_ = ${entity}.id_user_;
							_${entity}.id_${entity} = ${entity}.id_${entity};
							await _${entity}
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
			if (typeof value == \`\${type}\`) {
				if (typeof value == 'string' || typeof value == 'number') {
					if (value.toString().length > _length) {
						reject({
							..._mensajes[8],
							descripcion: _mensajes[8].descripcion
								.replace('_nombreCampo', \`\${attribute}\`)
								.replace('_caracteresEsperados', \`\${_length}\`),
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
						.replace('_nombreCampo', \`\${attribute}\`)
						.replace('_tipoEsperado', \`\${type}\`),
				});
			}
		} else {
			reject({
				..._mensajes[6],
				descripcion: _mensajes[6].descripcion.replace(
					'_nombreCampo',
					\`\${attribute}\`
				),
			});
		}
	});
};
	`;
		if (!fs.existsSync(dir)) {
			fs.writeFileSync(dir, `${classContent}`);
			resolve('');
		}
	});
};

const generateEntityNetwork = (
	basePath: string,
	scheme: string,
	entity: string,
	attributeToQuery: string
) => {
	const dir = `${basePath}/app/${scheme}/${entity}/${entity}.network.ts`;
	const classContent = `
	import express from 'express';
import { error, success } from '../../../network/response';
import { validation } from './${entity}.controller';
const router${entityToUpperCase(entity)} = express.Router();
import { ${entityToUpperCase(entity)} } from './${entity}.class';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';

router${entityToUpperCase(
		entity
	)}.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
		entity
	)}) => {
			success(res, ${entityToUpperCaseOutInitial(entity)});
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

router${entityToUpperCase(
		entity
	)}.get('/read/:${attributeToQuery}', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((${entityToUpperCaseOutInitial(entity)}s: ${entityToUpperCase(
		entity
	)}[]) => {
			res.status(200).send(${entityToUpperCaseOutInitial(entity)}s);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

router${entityToUpperCase(
		entity
	)}.get('/specificRead/:id_${entity}', async (req: any, res: any) => {
await validation(req.params, req.url, req.headers.token)
	.then((${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
		entity
	)}) => {
		res.status(200).send(${entityToUpperCaseOutInitial(entity)});
	})
	.catch((err: Mensaje | any) => {
		error(res, err);
	});
});

router${entityToUpperCase(
		entity
	)}.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((${entityToUpperCaseOutInitial(entity)}: ${entityToUpperCase(
		entity
	)}) => {
			success(res, ${entityToUpperCaseOutInitial(entity)});
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

router${entityToUpperCase(
		entity
	)}.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { router${entityToUpperCase(entity)} };
	`;
	if (!fs.existsSync(dir)) {
		fs.writeFileSync(dir, `${classContent}`);
	}
};

const generateEntityStore = (
	basePath: string,
	scheme: string,
	entity: string,
	columns: [],
	attributeToQuery: string,
	externasTables: []
) => {
	const dir = `${basePath}/app/${scheme}/${entity}/${entity}.store.ts`;
	let createParams = ``;
	let updateParams = ``;

	columns.map((item: any) => {
		updateParams += `${
			item.column_name_.substring(0, 3) == 'id_' &&
			item.column_name_ != `id_${entity}`
				? `\${${entity}.${item.column_name_.substring(
						3,
						item.column_name_.length
				  )}.${item.column_name_}},\n`
				: `${
						item.column_type_ == 'character varying'
							? `'\${${entity}.${item.column_name_}}',`
							: `\${${entity}.${item.column_name_}},`
				  }\n`
		}`;
	});

	createParams = `\${${entity}.id_user_}}`;
	updateParams = `\${${entity}.id_user_},\n${updateParams}`;

	createParams = createParams.substring(0, createParams.length - 1);

	externasTables.map((itemTable: any[], i) => {
		if (itemTable.length > 0) {
			let idTable = itemTable[0].column_name_;
			let nameTable = idTable.substring(3, idTable.length);
			let columnsTable: string = ``;

			itemTable.map((itemColumn: any) => {
				columnsTable += `${
					itemColumn.column_name_ != `id_${nameTable}` &&
					itemColumn.column_name_ != `deleted_${nameTable}`
						? `${
								itemColumn.column_type_ == 'character varying'
									? `'\${${entity}.${nameTable}.${itemColumn.column_name_}}',\n`
									: `\${${entity}.${nameTable}.${itemColumn.column_name_}},\n`
						  }`
						: ``
				}`;
			});

			updateParams += columnsTable;
		}
	});

	updateParams = updateParams.substring(0, updateParams.length - 2);

	const classContent = `
	import { clientTSANTSAPostgreSQL } from '../../../utils/conections';
	import { _mensajes } from '../../../utils/mensaje/mensaje';
	import { ${entityToUpperCase(entity)} } from './${entity}.class';
	${
		externasTables.length != 0
			? `
			/**
			 * Inners and columns for the resolution of ids
			 */
	const COLUMNS_RETURN: string = \`\`;
	const INNERS_JOIN: string = \` ...\`;`
			: ''
	}
	
	export const dml_${entity}_create = (${entity}: ${entityToUpperCase(
		entity
	)}) => {
		return new Promise<${entityToUpperCase(entity)}[]>(async (resolve, reject) => {
			const query = \`select * from ${scheme}.dml_${entity}_create_modified(${createParams})\`;
			
			// console.log(query);

			try {
				const response = await clientTSANTSAPostgreSQL.query(query);
				resolve(response.rows);
			} catch (error: any) {
				if (error.detail == '_database') {
					reject({
						..._mensajes[3],
						descripcion: error.toString().slice(7),
					});
				} else {
					reject(error.toString());
				}
			}
		});
	};

	export const view_${entity} = (${entity}: ${entityToUpperCase(entity)}) => {
		return new Promise<${entityToUpperCase(entity)}[]>(async (resolve, reject) => {
			const query = \`select ${
				externasTables.length != 0 ? `\${COLUMNS_RETURN}` : '*'
			} from ${scheme}.view_${entity} v${
		externasTables.length != 0 ? `\${INNERS_JOIN}` : ''
	}\${${entity}.${attributeToQuery} != 'query-all' ? \` where lower(v.${attributeToQuery}) LIKE '%\${${entity}.${attributeToQuery}}%'\` : \`\`
			} order by v.id_${entity} desc\`;
			
			// console.log(query);

			try {
				const response = await clientTSANTSAPostgreSQL.query(query);
				resolve(response.rows);
			} catch (error: any) {
				if (error.detail == '_database') {
					reject({
						..._mensajes[3],
						descripcion: error.toString().slice(7),
					});
				} else {
					reject(error.toString());
				}
			}
		});
	};

	export const view_${entity}_specific_read = (${entity}: ${entityToUpperCase(
		entity
	)}) => {
		return new Promise<${entityToUpperCase(entity)}[]>(async (resolve, reject) => {
			const query = \`select ${
				externasTables.length != 0 ? `\${COLUMNS_RETURN}` : '*'
			} from ${scheme}.view_${entity} v ${
		externasTables.length != 0 ? `\${INNERS_JOIN} ` : ''
	}where v.id_${entity} = \${${entity}.id_${entity}}\`;
			
			// console.log(query);

			try {
				const response = await clientTSANTSAPostgreSQL.query(query);
				resolve(response.rows);
			} catch (error: any) {
				if (error.detail == '_database') {
					reject({
						..._mensajes[3],
						descripcion: error.toString().slice(7),
					});
				} else {
					reject(error.toString());
				}
			}
		});
	};
	
	export const dml_${entity}_update = (${entity}: ${entityToUpperCase(
		entity
	)}) => {
		return new Promise<${entityToUpperCase(entity)}[]>(async (resolve, reject) => {
			const query = \`select * from ${scheme}.dml_${entity}_update_modified(${updateParams})\`;
	
			// console.log(query);

			try {
				const response = await clientTSANTSAPostgreSQL.query(query);
				resolve(response.rows);
			} catch (error: any) {
				if (error.detail == '_database') {
					reject({
						..._mensajes[3],
						descripcion: error.toString().slice(7),
					});
				} else {
					reject(error.toString());
				}
			}
		});
	};
	
	export const dml_${entity}_delete = (${entity}: ${entityToUpperCase(
		entity
	)}) => {
		return new Promise<boolean>(async (resolve, reject) => {
			const query = \`select * from ${scheme}.dml_${entity}_delete${
		externasTables.length != 0 ? '_modified' : ''
	}(\${${entity}.id_user_},\${${entity}.id_${entity}}) as result\`;
			
			// console.log(query);
			
			try {
				const response = await clientTSANTSAPostgreSQL.query(query);
				resolve(response.rows[0].result);
			} catch (error: any) {
				if (error.detail == '_database') {
					reject({
						..._mensajes[3],
						descripcion: error.toString().slice(7),
					});
				} else {
					reject(error.toString());
				}
			}
		});
	};
	`;
	if (!fs.existsSync(dir)) {
		fs.writeFileSync(dir, `${classContent}`);
	}
};

const generateRestServices = (
	basePath: string,
	scheme: string,
	entity: string,
	columns: [],
	externasTables: []
) => {
	const dirPost = `${basePath}/app/${scheme}/${entity}/${entity}.rest.create.json`;
	const dirRead = `${basePath}/app/${scheme}/${entity}/${entity}.rest.read.json`;
	const dirspecificRead = `${basePath}/app/${scheme}/${entity}/${entity}.rest.specificRead.json`;
	const dirUpdate = `${basePath}/app/${scheme}/${entity}/${entity}.rest.update.json`;
	const dirDelete = `${basePath}/app/${scheme}/${entity}/${entity}.rest.delete.json`;
	const nameVarUrlBaseApp = 'urlBaseApiTSANTSA';
	const nameVarTokenApp = 'tokenTSANTSA';
	/**
	 * Generate
	 */
	let bodyPost = ``;
	let bodyUpdate = ``;
	let bodyDelete = ``;
	const _finalExternal = generateValueEntity(externasTables);

	columns.map((item: any) => {
		/**
		 * Update
		 */

		if (
			item.column_name_.substring(0, 3) == 'id_' &&
			item.column_name_ != `id_${entity}`
		) {
			let table = item.column_name_.substring(3, item.column_name_.length);

			let _bodyTable = _finalExternal.find((item) => item.nameTable == table);

			bodyUpdate += `"${
				item.column_name_ != `deleted_${entity}`
					? `${
							item.column_name_.substring(0, 3) == 'id_' &&
							item.column_name_ != `id_${entity}`
								? `${table}`
								: `${item.column_name_}`
					  }`
					: ''
			}": ${_bodyTable?.valueTable},`;
		} else if (item.column_name_ != `deleted_${entity}`) {
			bodyUpdate += `"${
				item.column_name_ != `deleted_${entity}` ? `${item.column_name_}` : ''
			}": ${
				item.column_type_ == 'numeric'
					? 1
					: item.column_type_ == 'boolean'
					? false
					: '""'
			},`;
		}
		/**
		 * Delete
		 */
		if (item.column_name_ == `id_${entity}`) {
			bodyDelete += `"${item.column_name_}": ${
				item.column_type_ == 'numeric'
					? 1
					: item.column_type_ == 'boolean'
					? false
					: '""'
			},`;
		}
	});
	bodyPost = `"id_user_": 1`;
	bodyUpdate = `"id_user_": 1, ${bodyUpdate.substring(
		0,
		bodyUpdate.length - 1
	)}`;
	bodyDelete = `"id_user_": 1, ${bodyDelete.substring(
		0,
		bodyDelete.length - 1
	)}`;

	let postServices = `
	{
		"nameFather": "${entity}",
		"name": "create",
		"method": "POST",
		"url": "{{${nameVarUrlBaseApp}}}/app/${scheme}/${entity}/create",
		"headers": {
			"token": "{{${nameVarTokenApp}}}"
		},
		"body": {${bodyPost}}
	}
	`;

	let getServices = `
	{
		"nameFather": "${entity}",
		"name": "read",
		"method": "GET",
		"url": "{{${nameVarUrlBaseApp}}}/app/${scheme}/${entity}/read/query-all",
		"headers": {
			"token": "{{${nameVarTokenApp}}}"
		}
	}
	`;

	let getSpecificReadServices = `
	{
		"nameFather": "${entity}",
		"name": "specificRead",
		"method": "GET",
		"url": "{{${nameVarUrlBaseApp}}}/app/${scheme}/${entity}/specificRead/{id_${entity}}",
		"headers": {
			"token": "{{${nameVarTokenApp}}}"
		}
	}
	`;

	let updateServices = `
	{
		"nameFather": "${entity}",
		"name": "update",
		"method": "PATCH",
		"url": "{{${nameVarUrlBaseApp}}}/app/${scheme}/${entity}/update",
		"headers": {
			"token": "{{${nameVarTokenApp}}}"
		},
		"body": {${bodyUpdate}}
	}
	`;

	let deleteServices = `
	{
		"nameFather": "${entity}",
		"name": "delete",
		"method": "DEL",
		"url": "{{${nameVarUrlBaseApp}}}/app/${scheme}/${entity}/delete",
		"headers": {
			"token": "{{${nameVarTokenApp}}}"
		},
		"params": {${bodyDelete}}
	}`;

	if (!fs.existsSync(dirPost)) {
		fs.writeFileSync(dirPost, `${postServices}`);
		fs.writeFileSync(dirRead, `${getServices}`);
		fs.writeFileSync(dirspecificRead, `${getSpecificReadServices}`);
		fs.writeFileSync(dirUpdate, `${updateServices}`);
		fs.writeFileSync(dirDelete, `${deleteServices}`);
	}
};

const generateValueEntity = (externasTables: []) => {
	let finalExternal: ExternasTables[] = [];
	externasTables.map((itemTable: any[]) => {
		if (itemTable.length > 0) {
			let _nameIdTable: string = itemTable[0].column_name_;
			let _valueTable: string = ``;
			let table: ExternasTables = { nameTable: '', valueTable: '' };

			let _nameTable = _nameIdTable.substring(3, _nameIdTable.length);

			table.nameTable = _nameTable;

			itemTable.map((itemColumn: any) => {
				_valueTable += `${
					itemColumn.column_name_ != `deleted_${_nameTable}`
						? `${itemColumn.column_name_}: ${
								itemColumn.column_name_.substring(0, 3) == `id_` &&
								itemColumn.column_name_ != `${_nameIdTable}`
									? '{}'
									: `${
											itemColumn.column_type_ == 'numeric'
												? 0
												: itemColumn.column_type_ == 'boolean'
												? false
												: '""'
									  }`
						  },`
						: ''
				}`;
			});

			table.valueTable = `{${_valueTable.substring(
				0,
				_valueTable.length - 1
			)}}`;
			finalExternal.push(table);
		}
	});

	return finalExternal;
};

interface ExternasTables {
	nameTable: string;
	valueTable: any;
}

const generateRouter = (basePath: string, scheme: string, entity: string) => {
	const dir = `${basePath}/app/${scheme}/${entity}/${entity}.routes.ts`;
	const classContent = `
	//import { router${entityToUpperCase(
		entity
	)} } from '../app/${scheme}/${entity}/${entity}.network';
	//app.use('/app/${scheme}/${entity}', router${entityToUpperCase(entity)});
	`;
	if (!fs.existsSync(dir)) {
		fs.writeFileSync(dir, `${classContent}`);
	}
};

const generateData = (basePath: string, scheme: string, entity: string) => {
	const dir = `${basePath}/app/${scheme}/${entity}/${entity}.data.ts`;

	const dataContent = `
	import { ${entityToUpperCase(entity)} } from './${entity}.class';
	export const _${entityToUpperCaseOutInitial(entity)} = new ${entityToUpperCase(
		entity
	)}();
	`;
	if (!fs.existsSync(dir)) {
		fs.writeFileSync(dir, `${dataContent}`);
	}
};
