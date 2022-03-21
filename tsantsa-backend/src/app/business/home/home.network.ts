import express from 'express';
import { error } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Home } from './home.class';
import { validation } from './home.controller';
const routerHome = express.Router();

routerHome.get('/readBox', async (req: any, res: any) => {
	await validation(req.url, req.headers.token)
		.then((home: Home) => {
			res.status(200).send(home);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerHome.get('/readDetails', async (req: any, res: any) => {
	await validation(req.url, req.headers.token)
		.then((home: Home) => {
			res.status(200).send(home);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerHome };
