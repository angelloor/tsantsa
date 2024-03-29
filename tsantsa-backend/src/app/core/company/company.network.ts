import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Company } from './company.class';
import { validation } from './company.controller';
const routerCompany = express.Router();

routerCompany.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((company: Company) => {
			success(res, company);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCompany.get('/read/:name_company', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((companys: Company[]) => {
			res.status(200).send(companys);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCompany.get('/specificRead/:id_company', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((company: Company) => {
			res.status(200).send(company);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCompany.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((company: Company) => {
			success(res, company);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCompany.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerCompany };
