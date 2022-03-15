import express from 'express';
import { error, success } from '../network/response';
import { entityBackendGenerate } from './dev.backend.controller';
import { entityFrontendGenerate } from './dev.frontend.controller';
const routerDev = express.Router();

routerDev.post('/entityBackendGenerate', (req: any, res: any) => {
	entityBackendGenerate(req.body)
		.then((response: any) => {
			success(res, 'Exito');
		})
		.catch((err) => {
			error(res, err);
		});
});

routerDev.post('/entityFrontendGenerate', (req: any, res: any) => {
	entityFrontendGenerate(req.body)
		.then((response: any) => {
			success(res, 'Exito');
		})
		.catch((err) => {
			error(res, err);
		});
});

export { routerDev };
