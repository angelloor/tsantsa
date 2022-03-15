import express from 'express';
import { error, success } from '../../../network/response';
import { uploadAvatar } from '../../../utils/fileStorage';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { User } from './user.class';
import { validation } from './user.controller';
const routerUser = express.Router();

routerUser.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((user: User) => {
			success(res, user);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUser.get('/read/:name_user', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((users: User[]) => {
			res.status(200).send(users);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUser.get('/specificRead/:id_user', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((user: User) => {
			res.status(200).send(user);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUser.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((user: User) => {
			success(res, user);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUser.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerUser.post(
	'/uploadAvatar',
	uploadAvatar.single(`avatar`),
	async (req: any, res: any) => {
		await validation(req.body, req.url, req.headers.token)
			.then((response: any) => {
				success(res, response);
			})
			.catch((err) => {
				error(res, err);
			});
	}
);

routerUser.post('/removeAvatar', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((response: any) => {
			success(res, response);
		})
		.catch((err) => {
			error(res, err);
		});
});

export { routerUser };
