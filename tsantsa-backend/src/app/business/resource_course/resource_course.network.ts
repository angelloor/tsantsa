import express from 'express';
import { error, success } from '../../../network/response';
import { uploadFile } from '../../../utils/fileStorage';
import { Mensaje } from '../../../utils/mensaje/mensaje.type';
import { ResourceCourse } from './resource_course.class';
import { validation } from './resource_course.controller';
const routerResourceCourse = express.Router();

routerResourceCourse.post(
	'/create',
	uploadFile.single(`file`),
	async (req: any, res: any) => {
		const _resource_course = {
			...req.body,
			id_user_: parseInt(req.body.id_user_),
			course: {
				id_course: parseInt(req.body.id_course),
			},
			user: {
				id_user: parseInt(req.body.id_user_),
			},
		};

		delete _resource_course.id_course;

		await validation(_resource_course, req.url, req.headers.token)
			.then((resourceCourse: ResourceCourse) => {
				success(res, resourceCourse);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerResourceCourse.get(
	'/read/:course/:file_name',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((resourceCourses: ResourceCourse[]) => {
				res.status(200).send(resourceCourses);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerResourceCourse.get(
	'/specificRead/:id_resource_course',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((resourceCourse: ResourceCourse) => {
				res.status(200).send(resourceCourse);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerResourceCourse.get(
	'/byCourseRead/:course',
	async (req: any, res: any) => {
		await validation(req.params, req.url, req.headers.token)
			.then((resourceCourse: ResourceCourse) => {
				res.status(200).send(resourceCourse);
			})
			.catch((err: Mensaje | any) => {
				error(res, err);
			});
	}
);

routerResourceCourse.post('/downloadFile', async (req: any, res: any) => {
	await validation(req.body, req.url, req.headers.token)
		.then((data: any) => {
			res.sendFile(data);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

routerResourceCourse.delete('/delete', async (req: any, res: any) => {
	await validation(req.query, req.url, req.headers.token)
		.then((response: boolean) => {
			success(res, response);
		})
		.catch((err: Mensaje | any) => {
			error(res, err);
		});
});

export { routerResourceCourse };
