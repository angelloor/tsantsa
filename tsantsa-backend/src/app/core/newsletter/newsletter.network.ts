import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Newsletter } from './newsletter.class';
import { validation } from './newsletter.controller';
const routerNewsletter = express.Router();

routerNewsletter.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((newsletter: Newsletter) => {
			success(res, newsletter);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerNewsletter.get('/read/:name_newsletter', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((newsletters: Newsletter[]) => {
			res.status(200).send(newsletters);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerNewsletter.get(
	'/specificRead/:id_newsletter',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((newsletter: Newsletter) => {
				res.status(200).send(newsletter);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerNewsletter.get('/byCompanyRead/:company', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((newsletter: Newsletter) => {
			res.status(200).send(newsletter);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerNewsletter.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((newsletter: Newsletter) => {
			success(res, newsletter);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerNewsletter.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerNewsletter };
