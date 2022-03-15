import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Comment } from './comment.class';
import { validation } from './comment.controller';
const routerComment = express.Router();

routerComment.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((comment: Comment) => {
			success(res, comment);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerComment.get('/read/:value_comment', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((comments: Comment[]) => {
			res.status(200).send(comments);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerComment.get('/specificRead/:id_comment', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((comment: Comment) => {
			res.status(200).send(comment);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerComment.get('/byUserTaskRead/:user_task', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((comment: Comment) => {
			res.status(200).send(comment);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerComment.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((comment: Comment) => {
			success(res, comment);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerComment.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerComment };
