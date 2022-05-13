import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { CommentForum } from './comment_forum.class';
import { validation } from './comment_forum.controller';
const routerCommentForum = express.Router();

routerCommentForum.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((commentForum: CommentForum) => {
			success(res, commentForum);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCommentForum.get(
	'/read/:value_comment_forum',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((commentForums: CommentForum[]) => {
				res.status(200).send(commentForums);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerCommentForum.get(
	'/specificRead/:id_comment_forum',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((commentForum: CommentForum) => {
				res.status(200).send(commentForum);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerCommentForum.get('/byForumRead/:forum', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((commentForum: CommentForum) => {
			res.status(200).send(commentForum);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCommentForum.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((commentForum: CommentForum) => {
			success(res, commentForum);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCommentForum.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerCommentForum };
