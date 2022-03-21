import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Career } from './career.class';
import { validation } from './career.controller';
const routerCareer = express.Router();

routerCareer.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((career: Career) => {
			success(res, career);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCareer.get('/read/:name_career', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((careers: Career[]) => {
			res.status(200).send(careers);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCareer.get('/specificRead/:id_career', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((career: Career) => {
			res.status(200).send(career);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCareer.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((career: Career) => {
			success(res, career);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCareer.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCareer.post('/reportCareer', async (req: any, res: any) => {
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
export { routerCareer };
