import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Glossary } from './glossary.class';
import { validation } from './glossary.controller';
const routerGlossary = express.Router();

routerGlossary.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((glossary: Glossary) => {
			success(res, glossary);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerGlossary.get(
	'/read/:course/:term_glossary',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((glossarys: Glossary[]) => {
				res.status(200).send(glossarys);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerGlossary.get('/specificRead/:id_glossary', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((glossary: Glossary) => {
			res.status(200).send(glossary);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerGlossary.get('/byCourseRead/:course', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((glossary: Glossary) => {
			res.status(200).send(glossary);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerGlossary.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((glossary: Glossary) => {
			success(res, glossary);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerGlossary.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerGlossary };
