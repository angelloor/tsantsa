import express from 'express';
import { error, success } from '../../../network/response';
import { uploadFile } from '../../../utils/fileStorage';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Attached } from './attached.class';
import { validation } from './attached.controller';
const routerAttached = express.Router();

routerAttached.post(
	'/create',
	uploadFile.single(`file`),
	async (req: any, res: any) => {
		const _attached = {
			...req.body,
			user_task: {
				id_user_task: req.body.id_user_task,
			},
		};

		delete _attached.id_user_task;

		await validation(_attached, req.url, req.headers.token)
			.then((attached: Attached) => {
				success(res, attached);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerAttached.get('/read/:file_name', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((attacheds: Attached[]) => {
			res.status(200).send(attacheds);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerAttached.get('/specificRead/:id_attached', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((attached: Attached) => {
			res.status(200).send(attached);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerAttached.get('/byUserTaskRead/:user_task', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((attached: Attached) => {
			res.status(200).send(attached);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerAttached.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerAttached.post('/downloadFile', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((data: any) => {
			res.sendFile(data);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerAttached };
