import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Resource } from './resource.class';
import { validation } from './resource.controller';
const routerResource = express.Router();

routerResource.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((resource: Resource) => {
			success(res, resource);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerResource.get('/read/:name_resource', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((resources: Resource[]) => {
			res.status(200).send(resources);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerResource.get('/specificRead/:id_resource', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((resource: Resource) => {
			res.status(200).send(resource);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerResource.get('/byTaskRead/:task', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((resource: Resource) => {
			res.status(200).send(resource);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerResource.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((resource: Resource) => {
			success(res, resource);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerResource.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerResource };
