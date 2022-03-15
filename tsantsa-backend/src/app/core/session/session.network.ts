import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Session } from './session.class';
import { validation } from './session.controller';
const routerSession = express.Router();

routerSession.get('/read/:host_session', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((sessions: Session[]) => {
			res.status(200).send(sessions);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerSession.get('/specificRead/:id_session', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((session: Session) => {
			res.status(200).send(session);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerSession.get('/byUserRead/:user', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((session: Session) => {
			res.status(200).send(session);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerSession.patch('/bySessionRelease', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerSession.patch('/byUserReleaseAll', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerSession.patch('/byCompanyReleaseAll', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerSession };
