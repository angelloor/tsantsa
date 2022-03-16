import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Assistance } from './assistance.class';
import { validation } from './assistance.controller';
const routerAssistance = express.Router();

routerAssistance.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((assistance: Assistance) => {
			success(res, assistance);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerAssistance.get('/read/:course', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((assistance: Assistance) => {
			res.status(200).send(assistance);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerAssistance.get(
	'/specificRead/:id_assistance',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((assistance: Assistance) => {
				res.status(200).send(assistance);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerAssistance.get('/byUserRead/:user', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((assistance: Assistance) => {
			res.status(200).send(assistance);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerAssistance.get('/byCourseRead/:course', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((assistance: Assistance) => {
			res.status(200).send(assistance);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerAssistance.get(
	'/byUserAndCourseRead/:user/:course',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((assistance: Assistance) => {
				res.status(200).send(assistance);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerAssistance.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((assistance: Assistance) => {
			success(res, assistance);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerAssistance.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerAssistance };
