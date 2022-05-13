import path from 'path';
import { generateRandomNumber } from '../../../utils/global';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { User } from '../../core/user/user.class';
import { _user } from '../../core/user/user.data';
import { Report } from '../../report/report.class';
import { reportTaskByCourse } from '../../report/report.declarate';
import { Course } from '../course/course.class';
import { _course } from '../course/course.data';
import { Partial } from '../partial/partial.class';
import { _partial } from '../partial/partial.data';
import {
	dml_task_create,
	dml_task_delete,
	dml_task_send,
	dml_task_update,
	view_all_task,
	view_task,
	view_task_by_course_read,
	view_task_by_user_read,
	view_task_specific_read,
} from './task.store';

export class Task {
	/** Attributes */
	public id_user_?: number;
	public id_task: number;
	public course: Course;
	public user: User;
	public partial: Partial;
	public name_task?: string;
	public description_task?: string;
	public status_task?: boolean;
	public creation_date_task?: string;
	public limit_date?: string;
	public deleted_task?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_task: number = 0,
		course: Course = _course,
		user: User = _user,
		partial: Partial = _partial,
		name_task: string = '',
		description_task: string = '',
		status_task: boolean = false,
		creation_date_task: string = '',
		limit_date: string = '',
		deleted_task: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_task = id_task;
		this.course = course;
		this.user = user;
		this.partial = partial;
		this.name_task = name_task;
		this.description_task = description_task;
		this.status_task = status_task;
		this.creation_date_task = creation_date_task;
		this.limit_date = limit_date;
		this.deleted_task = deleted_task;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_task(id_task: number) {
		this.id_task = id_task;
	}
	get _id_task() {
		return this.id_task;
	}

	set _course(course: Course) {
		this.course = course;
	}
	get _course() {
		return this.course;
	}

	set _user(user: User) {
		this.user = user;
	}
	get _user() {
		return this.user;
	}

	set _partial(partial: Partial) {
		this.partial = partial;
	}
	get _partial() {
		return this.partial;
	}

	set _name_task(name_task: string) {
		this.name_task = name_task;
	}
	get _name_task() {
		return this.name_task!;
	}

	set _description_task(description_task: string) {
		this.description_task = description_task;
	}
	get _description_task() {
		return this.description_task!;
	}

	set _status_task(status_task: boolean) {
		this.status_task = status_task;
	}
	get _status_task() {
		return this.status_task!;
	}

	set _creation_date_task(creation_date_task: string) {
		this.creation_date_task = creation_date_task;
	}
	get _creation_date_task() {
		return this.creation_date_task!;
	}

	set _limit_date(limit_date: string) {
		this.limit_date = limit_date;
	}
	get _limit_date() {
		return this.limit_date!;
	}

	set _deleted_task(deleted_task: boolean) {
		this.deleted_task = deleted_task;
	}
	get _deleted_task() {
		return this.deleted_task!;
	}

	/** Methods */
	create() {
		return new Promise<Task>(async (resolve, reject) => {
			await dml_task_create(this)
				.then((tasks: Task[]) => {
					/**
					 * Mutate response
					 */
					const _tasks = this.mutateResponse(tasks);

					resolve(_tasks[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Task[]>(async (resolve, reject) => {
			await view_task(this)
				.then((tasks: Task[]) => {
					/**
					 * Mutate response
					 */
					const _tasks = this.mutateResponse(tasks);

					resolve(_tasks);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	allRead() {
		return new Promise<Task[]>(async (resolve, reject) => {
			await view_all_task()
				.then((tasks: Task[]) => {
					/**
					 * Mutate response
					 */
					const _tasks = this.mutateResponse(tasks);

					resolve(_tasks);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Task>(async (resolve, reject) => {
			await view_task_specific_read(this)
				.then((tasks: Task[]) => {
					/**
					 * Mutate response
					 */
					const _tasks = this.mutateResponse(tasks);

					resolve(_tasks[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byUserRead() {
		return new Promise<Task[]>(async (resolve, reject) => {
			await view_task_by_user_read(this)
				.then((tasks: Task[]) => {
					/**
					 * Mutate response
					 */
					const _tasks = this.mutateResponse(tasks);

					resolve(_tasks);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Task>(async (resolve, reject) => {
			await dml_task_update(this)
				.then((tasks: Task[]) => {
					/**
					 * Mutate response
					 */
					const _tasks = this.mutateResponse(tasks);

					resolve(_tasks[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	sendTask() {
		return new Promise<Task>(async (resolve, reject) => {
			await dml_task_send(this)
				.then((tasks: Task[]) => {
					/**
					 * Mutate response
					 */
					const _tasks = this.mutateResponse(tasks);

					resolve(_tasks[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_task_delete(this)
				.then((response: boolean) => {
					resolve(response);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	/**
	 * Reports
	 */
	reportTaskByCourse() {
		return new Promise<any>(async (resolve, reject) => {
			await view_task_by_course_read(this)
				.then(async (tasks: Task[]) => {
					if (tasks.length > 0) {
						/**
						 * Mutate response
						 */
						const _tasks = this.mutateResponse(tasks);

						const name_report = `report${generateRandomNumber(9)}`;

						const pathFinal = `${path.resolve(
							'./'
						)}/file_store/report/${name_report}.pdf`;
						/**
						 * Generar html
						 */
						const html = await reportTaskByCourse(_tasks);
						/**
						 * Instance the class
						 */
						const _report = new Report();

						const landscape: boolean = false;

						await _report
							.generateReport(name_report, html, landscape)
							.then(() => {
								resolve({ pathFinal, name_report });
							})
							.catch((error: any) => {
								reject(error);
							});
					} else {
						resolve(_mensajes[10]);
					}
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}
	/**
	 * Eliminar ids de entidades externas y formatear la informacion en el esquema correspondiente
	 * @param tasks
	 * @returns
	 */
	private mutateResponse(tasks: Task[]): Task[] {
		let _tasks: Task[] = [];

		tasks.map((item: any) => {
			let _task: Task | any = {
				...item,
				course: {
					id_course: item.id_course,
					period: {
						id_period: item.id_period,
						name_period: item.name_period,
						description_period: item.description_period,
						start_date_period: item.start_date_period,
						end_date_period: item.end_date_period,
						maximum_rating: item.maximum_rating,
						approval_note_period: item.approval_note_period,
					},
					career: {
						id_career: item.id_career,
						name_career: item.name_career,
						description_career: item.description_career,
						status_career: item.status_career,
						creation_date_career: item.creation_date_career,
					},
					schedule: {
						id_schedule: item.id_schedule,
						start_date_schedule: item.start_date_schedule,
						end_date_schedule: item.end_date_schedule,
						tolerance_schedule: item.tolerance_schedule,
						creation_date_schedule: item.creation_date_schedule,
					},
					name_course: item.name_course,
					description_course: item.description_course,
					status_course: item.status_course,
					creation_date_course: item.creation_date_course,
				},
				user: {
					id_user: item.id_user,
				},
				partial: {
					id_partial: item.id_partial,
				},
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _task.id_course;
			delete _task.id_user;
			delete _task.name_course;
			delete _task.description_course;
			delete _task.status_course;
			delete _task.creation_date_course;

			delete _task.id_period;
			delete _task.name_period;
			delete _task.description_period;
			delete _task.start_date_period;
			delete _task.end_date_period;
			delete _task.maximum_rating;
			delete _task.approval_note_period;

			delete _task.id_career;
			delete _task.name_career;
			delete _task.description_career;
			delete _task.status_career;
			delete _task.creation_date_career;

			delete _task.id_schedule;
			delete _task.start_date_schedule;
			delete _task.end_date_schedule;
			delete _task.tolerance_schedule;
			delete _task.creation_date_schedule;

			_tasks.push(_task);
		});

		return _tasks;
	}
}
