import fs from 'fs';
import { getFullDate } from './date';

export const generate = (err: any) => {
	const date = new Date();
	const { day, month, fullYear, hours, minutes, seconds } = getFullDate(
		date.toString()
	);
	const time = `${hours}:${minutes}:${seconds}`;

	var dir = `./out`;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	var dir = `./out/logs`;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	var dirLog = `./out/logs/${day}-${month}-${fullYear}`;

	if (!fs.existsSync(dirLog)) {
		fs.mkdirSync(dirLog);
	}

	fs.writeFileSync(`${dirLog}/${time}.txt`, err);
};
