import { Task } from '../task/task.class';
import { _task } from '../task/task.data';
import {
	dml_resource_create,
	dml_resource_delete,
	dml_resource_update,
	view_resource,
	view_resource_by_task_read,
	view_resource_specific_read,
} from './resource.store';

export class Resource {
	/** Attributes */
	public id_user_?: number;
	public id_resource: number;
	public task: Task;
	public name_resource?: string;
	public description_resource?: string;
	public link_resource?: string;
	public deleted_resource?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_resource: number = 0,
		task: Task = _task,
		name_resource: string = '',
		description_resource: string = '',
		link_resource: string = '',
		deleted_resource: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_resource = id_resource;
		this.task = task;
		this.name_resource = name_resource;
		this.description_resource = description_resource;
		this.link_resource = link_resource;
		this.deleted_resource = deleted_resource;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_resource(id_resource: number) {
		this.id_resource = id_resource;
	}
	get _id_resource() {
		return this.id_resource;
	}

	set _task(task: Task) {
		this.task = task;
	}
	get _task() {
		return this.task;
	}

	set _name_resource(name_resource: string) {
		this.name_resource = name_resource;
	}
	get _name_resource() {
		return this.name_resource!;
	}

	set _description_resource(description_resource: string) {
		this.description_resource = description_resource;
	}
	get _description_resource() {
		return this.description_resource!;
	}

	set _link_resource(link_resource: string) {
		this.link_resource = link_resource;
	}
	get _link_resource() {
		return this.link_resource!;
	}

	set _deleted_resource(deleted_resource: boolean) {
		this.deleted_resource = deleted_resource;
	}
	get _deleted_resource() {
		return this.deleted_resource!;
	}

	/** Methods */
	create() {
		return new Promise<Resource>(async (resolve, reject) => {
			await dml_resource_create(this)
				.then((resources: Resource[]) => {
					/**
					 * Mutate response
					 */
					const _resources = this.mutateResponse(resources);

					resolve(_resources[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Resource[]>(async (resolve, reject) => {
			await view_resource(this)
				.then((resources: Resource[]) => {
					/**
					 * Mutate response
					 */
					const _resources = this.mutateResponse(resources);

					resolve(_resources);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Resource>(async (resolve, reject) => {
			await view_resource_specific_read(this)
				.then((resources: Resource[]) => {
					/**
					 * Mutate response
					 */
					const _resources = this.mutateResponse(resources);

					resolve(_resources[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byTaskRead() {
		return new Promise<Resource[]>(async (resolve, reject) => {
			await view_resource_by_task_read(this)
				.then((resources: Resource[]) => {
					/**
					 * Mutate response
					 */
					const _resources = this.mutateResponse(resources);

					resolve(_resources);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Resource>(async (resolve, reject) => {
			await dml_resource_update(this)
				.then((resources: Resource[]) => {
					/**
					 * Mutate response
					 */
					const _resources = this.mutateResponse(resources);

					resolve(_resources[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_resource_delete(this)
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
	 * @param resources
	 * @returns
	 */
	private mutateResponse(resources: Resource[]): Resource[] {
		let _resources: Resource[] = [];

		resources.map((item: any) => {
			let _resource: Resource | any = {
				...item,
				task: {
					id_task: item.id_task,
					name_task: item.name_task,
					description_task: item.description_task,
					status_task: item.status_task,
					creation_date_task: item.creation_date_task,
					limit_date: item.limit_date,
				},
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _resource.id_task;
			delete _resource.name_task;
			delete _resource.description_task;
			delete _resource.status_task;
			delete _resource.creation_date_task;
			delete _resource.limit_date;

			_resources.push(_resource);
		});

		return _resources;
	}
}
