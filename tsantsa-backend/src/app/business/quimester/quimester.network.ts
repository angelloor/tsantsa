import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Quimester } from './quimester.class';
import { validation } from './quimester.controller';
const routerQuimester = express.Router();

routerQuimester.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((quimester: Quimester) => {
			success(res, quimester);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerQuimester.get(
	'/read/:period/:name_quimester',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((quimesters: Quimester[]) => {
				res.status(200).send(quimesters);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerQuimester.get(
	'/specificRead/:id_quimester',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((quimester: Quimester) => {
				res.status(200).send(quimester);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerQuimester.get('/byPeriodRead/:period', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((quimester: Quimester) => {
			res.status(200).send(quimester);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerQuimester.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((quimester: Quimester) => {
			success(res, quimester);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerQuimester.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerQuimester };
