import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Forum } from './forum.class';
import { validation } from './forum.controller';
const routerForum = express.Router();

routerForum.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((forum: Forum) => {
			success(res, forum);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerForum.get('/read/:course/:title_forum', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((forums: Forum[]) => {
			res.status(200).send(forums);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerForum.get('/specificRead/:id_forum', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((forum: Forum) => {
			res.status(200).send(forum);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerForum.get('/byCourseRead/:course', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((forum: Forum) => {
			res.status(200).send(forum);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerForum.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((forum: Forum) => {
			success(res, forum);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerForum.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerForum };
