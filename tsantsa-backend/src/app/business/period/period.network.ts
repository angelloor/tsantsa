import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Period } from './period.class';
import { validation } from './period.controller';
const routerPeriod = express.Router();

routerPeriod.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((period: Period) => {
			success(res, period);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerPeriod.get('/read/:name_period', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((periods: Period[]) => {
			res.status(200).send(periods);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerPeriod.get('/specificRead/:id_period', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((period: Period) => {
			res.status(200).send(period);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerPeriod.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((period: Period) => {
			success(res, period);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerPeriod.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});
/**
 * Reports
 */
routerPeriod.post('/reportPeriod', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((response: any) => {
			if (response.codigo == '06-010') {
				/**
				 * Set message in headers
				 * message in exposedHeaders (index.js)
				 */
				res.set('message', JSON.stringify(response));
				res.send();
			} else {
				/**
				 * Set name_report in headers
				 * name_report in exposedHeaders (index.js)
				 */
				res.set('name_report', response.name_report);
				/**
				 * Send the file
				 */
				res.sendFile(response.pathFinal);
			}
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerPeriod };
