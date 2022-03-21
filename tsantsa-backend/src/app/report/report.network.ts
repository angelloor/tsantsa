import express from 'express';
import { error, success } from '../../network/response';
import { Mensaje } from '../../utils/mensaje/mensaje.type';
import { validation } from './report.controller';
const routerReport = express.Router();

routerReport.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerReport };
