import { UserTask } from '../user_task/user_task.class';
import { _userTask } from '../user_task/user_task.data';
import {
	dml_attached_create,
	dml_attached_delete,
	view_attached,
	view_attached_by_user_task_read,
	view_attached_specific_read,
} from './attached.store';

export class Attached {
	/** Attributes */
	public id_user_?: number;
	public id_attached: number;
	public user_task: UserTask;
	public file_name?: string;
	public length_mb?: string;
	public extension?: string;
	public server_path?: string;
	public upload_date?: string;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_attached: number = 0,
		user_task: UserTask = _userTask,
		file_name: string = '',
		length_mb: string = '',
		extension: string = '',
		server_path: string = '',
		upload_date: string = ''
	) {
		this.id_user_ = id_user_;
		this.id_attached = id_attached;
		this.user_task = user_task;
		this.file_name = file_name;
		this.length_mb = length_mb;
		this.extension = extension;
		this.server_path = server_path;
		this.upload_date = upload_date;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_attached(id_attached: number) {
		this.id_attached = id_attached;
	}
	get _id_attached() {
		return this.id_attached;
	}

	set _user_task(user_task: UserTask) {
		this.user_task = user_task;
	}
	get _user_task() {
		return this.user_task;
	}

	set _file_name(file_name: string) {
		this.file_name = file_name;
	}
	get _file_name() {
		return this.file_name!;
	}

	set _length_mb(length_mb: string) {
		this.length_mb = length_mb;
	}
	get _length_mb() {
		return this.length_mb!;
	}

	set _extension(extension: string) {
		this.extension = extension;
	}
	get _extension() {
		return this.extension!;
	}

	set _server_path(server_path: string) {
		this.server_path = server_path;
	}
	get _server_path() {
		return this.server_path!;
	}

	set _upload_date(upload_date: string) {
		this.upload_date = upload_date;
	}
	get _upload_date() {
		return this.upload_date!;
	}

	/** Methods */
	create() {
		return new Promise<Attached>(async (resolve, reject) => {
			await dml_attached_create(this)
				.then((attacheds: Attached[]) => {
					/**
					 * Mutate response
					 */
					const _attacheds = this.mutateResponse(attacheds);

					resolve(_attacheds[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Attached[]>(async (resolve, reject) => {
			await view_attached(this)
				.then((attacheds: Attached[]) => {
					/**
					 * Mutate response
					 */
					const _attacheds = this.mutateResponse(attacheds);

					resolve(_attacheds);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Attached>(async (resolve, reject) => {
			await view_attached_specific_read(this)
				.then((attacheds: Attached[]) => {
					/**
					 * Mutate response
					 */
					const _attacheds = this.mutateResponse(attacheds);

					resolve(_attacheds[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byUserTaskRead() {
		return new Promise<Attached[]>(async (resolve, reject) => {
			await view_attached_by_user_task_read(this)
				.then((attacheds: Attached[]) => {
					/**
					 * Mutate response
					 */
					const _attacheds = this.mutateResponse(attacheds);

					resolve(_attacheds);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_attached_delete(this)
				.then((response: boolean) => {
					resolve(response);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	/**
	 * Eliminar ids de entidades externas y formatear la informacion en el esquema correspondiente
	 * @param attacheds
	 * @returns
	 */
	private mutateResponse(attacheds: Attached[]): Attached[] {
		let _attacheds: Attached[] = [];

		attacheds.map((item: any) => {
			let _attached: Attached | any = {
				...item,
				user_task: {
					id_user_task: item.id_user_task,
					user: {
						id_user: item.id_user,
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
						course: {
							id_course: item.id_course,
							period: {
								id_period: item.id_period,
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
						name_task: item.name_task,
						description_task: item.description_task,
						status_task: item.status_task,
						creation_date_task: item.creation_date_task,
						limit_date: item.limit_date,
					},
					response_user_task: item.response_user_task,
					shipping_date_user_task: item.shipping_date_user_task,
					qualification_user_task: item.qualification_user_task,
					is_open: item.is_open,
					is_dispatched: item.is_dispatched,
					is_qualified: item.is_qualified,
				},
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _attached.id_user_task;
			delete _attached.id_user;
			delete _attached.id_task;
			delete _attached.response_user_task;
			delete _attached.shipping_date_user_task;
			delete _attached.qualification_user_task;
			delete _attached.is_open;
			delete _attached.is_dispatched;
			delete _attached.is_qualified;

			delete _attached.id_user;
			delete _attached.id_profile;
			delete _attached.type_user;
			delete _attached.name_user;
			delete _attached.password_user;
			delete _attached.avatar_user;
			delete _attached.status_user;

			delete _attached.id_person;
			delete _attached.id_academic;
			delete _attached.id_job;
			delete _attached.dni_person;
			delete _attached.name_person;
			delete _attached.last_name_person;
			delete _attached.address_person;
			delete _attached.phone_person;

			delete _attached.id_task;
			delete _attached.name_task;
			delete _attached.description_task;
			delete _attached.status_task;
			delete _attached.creation_date_task;
			delete _attached.limit_date;

			delete _attached.id_course;
			delete _attached.id_period;
			delete _attached.id_career;
			delete _attached.id_schedule;
			delete _attached.name_course;
			delete _attached.description_course;
			delete _attached.status_course;
			delete _attached.creation_date_course;
			_attacheds.push(_attached);
		});

		return _attacheds;
	}
}
