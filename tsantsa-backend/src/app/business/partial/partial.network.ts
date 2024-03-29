import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Partial } from './partial.class';
import { validation } from './partial.controller';
const routerPartial = express.Router();

routerPartial.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((partial: Partial) => {
			success(res, partial);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerPartial.get(
	'/read/:quimester/:name_partial',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((partials: Partial[]) => {
				res.status(200).send(partials);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerPartial.get('/specificRead/:id_partial', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((partial: Partial) => {
			res.status(200).send(partial);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerPartial.get('/byQuimesterRead/:quimester', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((partials: Partial[]) => {
			res.status(200).send(partials);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerPartial.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((partial: Partial) => {
			success(res, partial);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerPartial.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerPartial };
