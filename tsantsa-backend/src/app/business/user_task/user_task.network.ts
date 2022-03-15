import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { UserTask } from './user_task.class';
import { validation } from './user_task.controller';
const routerUserTask = express.Router();

routerUserTask.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((userTask: UserTask) => {
			success(res, userTask);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUserTask.get('/read/:response_user_task', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((userTasks: UserTask[]) => {
			res.status(200).send(userTasks);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUserTask.get(
	'/specificRead/:id_user_task',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((userTask: UserTask) => {
				res.status(200).send(userTask);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerUserTask.get('/byUserRead/:user', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((userTask: UserTask) => {
			res.status(200).send(userTask);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUserTask.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((userTask: UserTask) => {
			success(res, userTask);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUserTask.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerUserTask };
