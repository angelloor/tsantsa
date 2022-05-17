import path from 'path';
import { generateRandomNumber } from '../../../utils/global';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { User } from '../../core/user/user.class';
import { _user } from '../../core/user/user.data';
import { Report } from '../../report/report.class';
import { reportUserTaskByUser } from '../../report/report.declarate';
import { Task } from '../task/task.class';
import { _task } from '../task/task.data';
import {
	dml_user_task_create,
	dml_user_task_delete,
	dml_user_task_update,
	view_user_task,
	view_user_task_by_course_query_read,
	view_user_task_by_course_read,
	view_user_task_by_sender_user_read,
	view_user_task_by_task_query_read,
	view_user_task_by_task_read,
	view_user_task_by_user_read,
	view_user_task_specific_read,
} from './user_task.store';

export class UserTask {
	/** Attributes */
	public id_user_?: number;
	public id_user_task: number;
	public user: User;
	public task: Task;
	public response_user_task?: string;
	public shipping_date_user_task?: string;
	public qualification_user_task?: number;
	public is_open?: boolean;
	public is_dispatched?: boolean;
	public is_qualified?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_user_task: number = 0,
		user: User = _user,
		task: Task = _task,
		response_user_task: string = '',
		shipping_date_user_task: string = '',
		qualification_user_task: number = 0,
		is_open: boolean = false,
		is_dispatched: boolean = false,
		is_qualified: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_user_task = id_user_task;
		this.user = user;
		this.task = task;
		this.response_user_task = response_user_task;
		this.shipping_date_user_task = shipping_date_user_task;
		this.qualification_user_task = qualification_user_task;
		this.is_open = is_open;
		this.is_dispatched = is_dispatched;
		this.is_qualified = is_qualified;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_user_task(id_user_task: number) {
		this.id_user_task = id_user_task;
	}
	get _id_user_task() {
		return this.id_user_task;
	}

	set _user(user: User) {
		this.user = user;
	}
	get _user() {
		return this.user;
	}

	set _task(task: Task) {
		this.task = task;
	}
	get _task() {
		return this.task;
	}

	set _response_user_task(response_user_task: string) {
		this.response_user_task = response_user_task;
	}
	get _response_user_task() {
		return this.response_user_task!;
	}

	set _shipping_date_user_task(shipping_date_user_task: string) {
		this.shipping_date_user_task = shipping_date_user_task;
	}
	get _shipping_date_user_task() {
		return this.shipping_date_user_task!;
	}

	set _qualification_user_task(qualification_user_task: number) {
		this.qualification_user_task = qualification_user_task;
	}
	get _qualification_user_task() {
		return this.qualification_user_task!;
	}

	set _is_open(is_open: boolean) {
		this.is_open = is_open;
	}
	get _is_open() {
		return this.is_open!;
	}

	set _is_dispatched(is_dispatched: boolean) {
		this.is_dispatched = is_dispatched;
	}
	get _is_dispatched() {
		return this.is_dispatched!;
	}

	set _is_qualified(is_qualified: boolean) {
		this.is_qualified = is_qualified;
	}
	get _is_qualified() {
		return this.is_qualified!;
	}

	/** Methods */
	create() {
		return new Promise<UserTask>(async (resolve, reject) => {
			await dml_user_task_create(this)
				.then((userTasks: UserTask[]) => {
					/**
					 * Mutate response
					 */
					const _userTasks = this.mutateResponse(userTasks);

					resolve(_userTasks[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	queryRead() {
		return new Promise<UserTask[]>(async (resolve, reject) => {
			await view_user_task(this)
				.then((userTasks: UserTask[]) => {
					/**
					 * Mutate response
					 */
					const _userTasks = this.mutateResponse(userTasks);

					resolve(_userTasks);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byTaskQueryRead() {
		return new Promise<UserTask[]>(async (resolve, reject) => {
			await view_user_task_by_task_query_read(this)
				.then((userTasks: UserTask[]) => {
					/**
					 * Mutate response
					 */
					const _userTasks = this.mutateResponse(userTasks);

					resolve(_userTasks);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byCourseQueryRead() {
		return new Promise<UserTask[]>(async (resolve, reject) => {
			await view_user_task_by_course_query_read(this)
				.then((userTasks: UserTask[]) => {
					/**
					 * Mutate response
					 */
					const _userTasks = this.mutateResponse(userTasks);

					resolve(_userTasks);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<UserTask>(async (resolve, reject) => {
			await view_user_task_specific_read(this)
				.then((userTasks: UserTask[]) => {
					/**
					 * Mutate response
					 */
					const _userTasks = this.mutateResponse(userTasks);

					resolve(_userTasks[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byUserRead() {
		return new Promise<UserTask[]>(async (resolve, reject) => {
			await view_user_task_by_user_read(this)
				.then((userTasks: UserTask[]) => {
					/**
					 * Mutate response
					 */
					const _userTasks = this.mutateResponse(userTasks);

					resolve(_userTasks);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	bySenderUserRead() {
		return new Promise<UserTask[]>(async (resolve, reject) => {
			await view_user_task_by_sender_user_read(this)
				.then((userTasks: UserTask[]) => {
					/**
					 * Mutate response
					 */
					const _userTasks = this.mutateResponse(userTasks);

					resolve(_userTasks);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byTaskRead() {
		return new Promise<UserTask[]>(async (resolve, reject) => {
			await view_user_task_by_task_read(this)
				.then((userTasks: UserTask[]) => {
					/**
					 * Mutate response
					 */
					const _userTasks = this.mutateResponse(userTasks);

					resolve(_userTasks);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byCourseRead() {
		return new Promise<UserTask[]>(async (resolve, reject) => {
			await view_user_task_by_course_read(this)
				.then((userTasks: UserTask[]) => {
					/**
					 * Mutate response
					 */
					const _userTasks = this.mutateResponse(userTasks);

					resolve(_userTasks);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<UserTask>(async (resolve, reject) => {
			await dml_user_task_update(this)
				.then((userTasks: UserTask[]) => {
					/**
					 * Mutate response
					 */
					const _userTasks = this.mutateResponse(userTasks);

					resolve(_userTasks[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_user_task_delete(this)
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
	reportUserTaskByUser() {
		return new Promise<any>(async (resolve, reject) => {
			await view_user_task_by_user_read(this)
				.then(async (userTasks: UserTask[]) => {
					if (userTasks.length > 0) {
						/**
						 * Mutate response
						 */
						const _userTasks = this.mutateResponse(userTasks);

						const name_report = `report${generateRandomNumber(9)}`;

						const pathFinal = `${path.resolve(
							'./'
						)}/file_store/report/${name_report}.pdf`;
						/**
						 * Generar html
						 */
						const html = await reportUserTaskByUser(_userTasks);
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
	 * @param userTasks
	 * @returns
	 */
	private mutateResponse(userTasks: UserTask[]): UserTask[] {
		let _userTasks: UserTask[] = [];

		userTasks.map((item: any) => {
			let _userTask: UserTask | any = {
				...item,
				user: {
					id_user: item.bvut_id_user,
					person: {
						id_person: item.id_person,
						academic: {
							id_academic: item.id_academic,
						},
						job: {
							id_job: item.id_job,
						},
						dni_person: item.dni_person,
						name_person: item.name_person,
						last_name_person: item.last_name_person,
						address_person: item.address_person,
						phone_person: item.phone_person,
					},
					profile: {
						id_profile: item.id_profile,
					},
					type_user: item.type_user,
					name_user: item.name_user,
					password_user: item.password_user,
					avatar_user: item.avatar_user,
					status_user: item.status_user,
				},
				task: {
					id_task: item.id_task,
					user: {
						id_user: item.cvt_id_user,
					},
					course: {
						id_course: item.id_course,
						period: {
							id_period: item.id_period,
							maximum_rating: item.maximum_rating,
							approval_note_period: item.approval_note_period,
						},
						career: {
							id_career: item.id_career,
						},
						schedule: {
							id_schedule: item.id_schedule,
						},
						name_course: item.name_course,
						description_course: item.description_course,
						status_course: item.status_course,
						creation_date_course: item.creation_date_course,
					},
					partial: {
						id_partial: item.id_partial,
						quimester: {
							id_quimester: item.id_quimester,
							period: {
								id_period: item.id_period,
							},
							name_quimester: item.name_quimester,
						},
						name_partial: item.name_partial,
					},
					name_task: item.name_task,
					description_task: item.description_task,
					status_task: item.status_task,
					creation_date_task: item.creation_date_task,
					limit_date: item.limit_date,
				},
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of queryRead
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _userTask.bvut_id_user;
			delete _userTask.cvt_id_user;
			delete _userTask.id_profile;
			delete _userTask.type_user;
			delete _userTask.name_user;
			delete _userTask.password_user;
			delete _userTask.avatar_user;
			delete _userTask.status_user;

			delete _userTask.id_person;
			delete _userTask.id_academic;
			delete _userTask.id_job;
			delete _userTask.dni_person;
			delete _userTask.name_person;
			delete _userTask.last_name_person;
			delete _userTask.address_person;
			delete _userTask.phone_person;

			delete _userTask.id_task;
			delete _userTask.name_task;
			delete _userTask.description_task;
			delete _userTask.status_task;
			delete _userTask.creation_date_task;
			delete _userTask.limit_date;

			delete _userTask.id_course;
			delete _userTask.id_period;
			delete _userTask.maximum_rating;
			delete _userTask.approval_note_period;
			delete _userTask.id_career;
			delete _userTask.id_schedule;
			delete _userTask.name_course;
			delete _userTask.description_course;
			delete _userTask.status_course;
			delete _userTask.creation_date_course;

			_userTasks.push(_userTask);
		});

		return _userTasks;
	}
}
