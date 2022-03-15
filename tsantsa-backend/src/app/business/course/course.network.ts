import express from 'express';
import { error, success } from '../../../network/response';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { Course } from './course.class';
import { validation } from './course.controller';
const routerCourse = express.Router();

routerCourse.post('/create', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((course: Course) => {
			success(res, course);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCourse.get('/read/:name_course', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((courses: Course[]) => {
			res.status(200).send(courses);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCourse.get('/specificRead/:id_course', async (req: any, res: any) => {
	await validation(req.params, req.url, req.headers.token)
		.then((course: Course) => {
			res.status(200).send(course);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCourse.patch('/update', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((course: Course) => {
			success(res, course);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerCourse.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerCourse };
