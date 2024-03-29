import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Validation } from './validation.class';
import { validation } from './validation.controller';
const routerValidation = express.Router();

routerValidation.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((validation: Validation) => {
			success(res, validation);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerValidation.get(
	'/read/:message_validation',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((validations: Validation[]) => {
				res.status(200).send(validations);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerValidation.get(
	'/byTypeValidationRead/:type_validation',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((validation: Validation) => {
				res.status(200).send(validation);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerValidation.get(
	'/specificRead/:id_validation',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((validation: Validation) => {
				res.status(200).send(validation);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerValidation.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((validation: Validation) => {
			success(res, validation);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerValidation.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerValidation };
