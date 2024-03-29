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

routerUserTask.get('/queryRead/:user', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((userTasks: UserTask[]) => {
			res.status(200).send(userTasks);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUserTask.get(
	'/byTaskQueryRead/:task/:user',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((userTasks: UserTask[]) => {
				res.status(200).send(userTasks);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerUserTask.get(
	'/byCourseQueryRead/:task/:user',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((userTasks: UserTask[]) => {
				res.status(200).send(userTasks);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

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

routerUserTask.get('/bySenderUserRead/:user', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((userTask: UserTask) => {
			res.status(200).send(userTask);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUserTask.get('/byTaskRead/:task', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((userTask: UserTask) => {
			res.status(200).send(userTask);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUserTask.get('/byCourseRead/:task', async (req: any, res: any) => {
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

routerUserTask.post('/reportUserTaskByUser', async (req: any, res: any) => {
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

export { routerUserTask };
