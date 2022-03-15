import fs from 'fs';
import { getDate, getTimeLogs } from './date';

export const generate = (err: any) => {
	const { dia, mes, periodo } = getDate();
	const time = getTimeLogs();

	var dir = `./out`;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	var dir = `./out/logs`;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	var dirLog = `./out/logs/${dia}-${mes}-${periodo}`;

	if (!fs.existsSync(dirLog)) {
		fs.mkdirSync(dirLog);
	}

	fs.writeFileSync(`${dirLog}/${time}.txt`, err);
};
