import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Enrollment } from './enrollment.class';
import { validation } from './enrollment.controller';
const routerEnrollment = express.Router();

routerEnrollment.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((enrollment: Enrollment) => {
			success(res, enrollment);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerEnrollment.get('/read/:course', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((enrollment: Enrollment[]) => {
			res.status(200).send(enrollment);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerEnrollment.get(
	'/specificRead/:id_enrollment',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((enrollment: Enrollment) => {
				res.status(200).send(enrollment);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerEnrollment.get('/byCourseRead/:course', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((enrollment: Enrollment) => {
			res.status(200).send(enrollment);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerEnrollment.get('/byUserRead/:user', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((enrollment: Enrollment) => {
			res.status(200).send(enrollment);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerEnrollment.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((enrollment: Enrollment) => {
			success(res, enrollment);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerEnrollment.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerEnrollment.post(
	'/reportEnrollmentByCourse',
	async (req: any, res: any) => {
		await validation(req.body, req.url, req.headers.token)
			.then((response: any) => {
				if (response.codigo == '06-010') {
					/**
					 * Set message in headers
					 * message in exposedHeaders (index.js)
					 */
					res.set('message', JSON.stringify(response));
					res.send();
				} else {
					/**
					 * Set name_report in headers
					 * name_report in exposedHeaders (index.js)
					 */
					res.set('name_report', response.name_report);
					/**
					 * Send the file
					 */
					res.sendFile(response.pathFinal);
				}
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

export { routerEnrollment };
