/**
 *
 * @param entity entity
 * @returns Entity
 */
export const entityToUpperCaseInicial = (entity: string) => {
	return `${entity.substring(0, 1).toUpperCase()}${entity
		.substring(1, entity.length)
		.toLowerCase()}`;
};

export const entityToLowerCase = (entity: string) => {
	return entity.toLowerCase();
};
/**
 *
 * @param entity entity-other-entity
 * @returns entityOtherEntity
 */
export const entityToUpperCaseOutInitial = (entity: string) => {
	let letra: string = '';
	let newString: string = '';
	let position = undefined;
	for (let index = 0; index < entity.length; index++) {
		letra = entity.substring(index, index + 1);
		if (position != undefined) {
			newString += letra.toUpperCase();
			position = undefined;
		} else {
			newString += letra;
		}
		if (letra == '_') {
			position = index;
		}
	}
	return newString.replace(/\_/gi, '');
};
/**
 *
 * @param entity entity-other-entity
 * @returns EntityOtherEntity
 */
export const entityToUpperCase = (entity: string) => {
	let entityToUpperCase = entityToUpperCaseOutInitial(entity);
	return `${entityToUpperCase
		.substring(0, 1)
		.toUpperCase()}${entityToUpperCase.substring(1, entityToUpperCase.length)}`;
};
/**
 *
 * @param entity
 * @returns entity_other_entity
 */
export const entityReplaceUnderscore = (entity: string) => {
	return entity.replace(/\_/gi, '-');
};
