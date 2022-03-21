/**
 * Return { day, month, fullYear, hours, minutes, seconds }
 */
export const getFullDate = (stringDate: string) => {
	const date = new Date(stringDate);
	return {
		day: addCeroNumber(date.getDate()),
		month: addCeroNumber(date.getMonth() + 1),
		fullYear: date.getFullYear(),
		hours: addCeroNumber(date.getHours()),
		minutes: addCeroNumber(date.getMinutes()),
		seconds: addCeroNumber(date.getSeconds()),
	};
};
/**
 * Return yyyy/mm/ddThh:mm:ss.000Z
 */
export const parseDateToString = (date: Date) => {
	return `${date.getFullYear()}-${addCeroNumber(
		date.getMonth() + 1
	)}-${addCeroNumber(date.getDate())}T${addCeroNumber(
		date.getHours()
	)}:${addCeroNumber(date.getMinutes())}:${addCeroNumber(
		date.getSeconds()
	)}.000Z`;
};
/**
 * createDateAsUTC -5
 */
export const createDateAsUTC = (initialDate: Date) => {
	return new Date(
		Date.UTC(
			initialDate.getFullYear(),
			initialDate.getMonth(),
			initialDate.getDate(),
			initialDate.getHours(),
			initialDate.getMinutes(),
			initialDate.getSeconds()
		)
	);
};
/**
 * convertDateToUTC +5
 */
export const convertDateToUTC = (initialDate: Date) => {
	return new Date(
		initialDate.getUTCFullYear(),
		initialDate.getUTCMonth(),
		initialDate.getUTCDate(),
		initialDate.getUTCHours(),
		initialDate.getUTCMinutes(),
		initialDate.getUTCSeconds()
	);
};
/**
 * addCeroNumber
 * @param number
 * @returns string
 */
const addCeroNumber = (number: number): string => {
	return number <= 9 ? `0${number}` : `${number}`;
};
