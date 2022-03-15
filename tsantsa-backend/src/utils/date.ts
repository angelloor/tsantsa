/**
 * Return hh:mm:ss
 */
export const getTime = (date: Date) => {
	return `${date.getHours() <= 9 ? '0' + date.getHours() : date.getHours()}:${
		date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes()
	}:${date.getSeconds() <= 9 ? '0' + date.getSeconds() : date.getSeconds()}`;
};
/**
 * Return dd/mm/yyyy
 */
export const getDate = () => {
	const date = new Date();
	return {
		dia: date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate(),
		mes:
			date.getMonth() + 1 <= 9
				? `0${date.getMonth() + 1}`
				: date.getMonth() + 1,
		periodo: date.getFullYear(),
	};
};
/**
 * Obtener la hora para logs
 */
export const getTimeLogs = () => {
	const date = new Date();
	return `${date.getHours() <= 9 ? '0' + date.getHours() : date.getHours()}-${
		date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes()
	}-${date.getSeconds() <= 9 ? '0' + date.getSeconds() : date.getSeconds()}`;
};
/**
 * Return dd/mm/yyyy hh:mm:ss
 */
export const getFullDate = () => {
	const date = new Date();
	return `${getDate().dia}-${getDate().mes}-${getDate().periodo} ${getTime(
		date
	)}`;
};
/**
 * Return yyyy/mm/ddThh:mm:ss.027Z
 */
export const getFullDateISO801 = () => {
	const date = new Date();
	return `${getDate().periodo}-${getDate().mes}-${getDate().dia}T${getTime(
		date
	)}.027Z`;
};
/**
 * Return yyyy/mm/ddThh:mm:ss.027Z
 */
export const parseDateToString = (fecha: Date) => {
	return `${fecha.getFullYear()}-${
		fecha.getMonth() + 1 <= 9
			? `0${fecha.getMonth() + 1}`
			: fecha.getMonth() + 1
	}-${fecha.getDate() <= 9 ? `0${fecha.getDate()}` : fecha.getDate()}T${getTime(
		fecha
	)}.000Z`;
};
/**
 * -5
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
 * +5
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
 * Función para obtener el mes actual en formato (Enero - Diciembre) y el año actual
 */
export const generatePath = (fecha: string) => {
	const dia = parseInt(fecha.substring(0, 2), 0);
	const mes = parseInt(fecha.substring(3, 5), 0) - 1;
	const periodo = parseInt(fecha.substring(6, 11), 0);

	const date = new Date(periodo, mes, dia);
	let month = '';

	const numberMonth = date.getMonth();
	const year = date.getFullYear();

	if (numberMonth == 0) {
		month = 'Enero';
	}
	if (numberMonth == 1) {
		month = 'Febrero';
	}
	if (numberMonth == 2) {
		month = 'Marzo';
	}
	if (numberMonth == 3) {
		month = 'Abril';
	}
	if (numberMonth == 4) {
		month = 'Mayo';
	}
	if (numberMonth == 5) {
		month = 'Junio';
	}
	if (numberMonth == 6) {
		month = 'Julio';
	}
	if (numberMonth == 7) {
		month = 'Agosto';
	}
	if (numberMonth == 8) {
		month = 'Septiembre';
	}
	if (numberMonth == 9) {
		month = 'Octubre';
	}
	if (numberMonth == 10) {
		month = 'Noviembre';
	}
	if (numberMonth == 11) {
		month = 'Diciembre';
	}
	return { month, year };
};
