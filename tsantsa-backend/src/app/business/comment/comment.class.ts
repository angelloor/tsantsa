import { User } from '../../core/user/user.class';
import { _user } from '../../core/user/user.data';
import { UserTask } from '../user_task/user_task.class';
import { _userTask } from '../user_task/user_task.data';
import {
	dml_comment_create,
	dml_comment_delete,
	dml_comment_update,
	view_comment,
	view_comment_by_user_task_read,
	view_comment_specific_read,
} from './comment.store';

export class Comment {
	/** Attributes */
	public id_user_?: number;
	public id_comment: number;
	public user_task: UserTask;
	public user: User;
	public value_comment?: string;
	public date_comment?: string;
	public deleted_comment?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_comment: number = 0,
		user_task: UserTask = _userTask,
		user: User = _user,
		value_comment: string = '',
		date_comment: string = '',
		deleted_comment: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_comment = id_comment;
		this.user_task = user_task;
		this.user = user;
		this.value_comment = value_comment;
		this.date_comment = date_comment;
		this.deleted_comment = deleted_comment;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_comment(id_comment: number) {
		this.id_comment = id_comment;
	}
	get _id_comment() {
		return this.id_comment;
	}

	set _user_task(user_task: UserTask) {
		this.user_task = user_task;
	}
	get _user_task() {
		return this.user_task;
	}

	set _user(user: User) {
		this.user = user;
	}
	get _user() {
		return this.user;
	}

	set _value_comment(value_comment: string) {
		this.value_comment = value_comment;
	}
	get _value_comment() {
		return this.value_comment!;
	}

	set _date_comment(date_comment: string) {
		this.date_comment = date_comment;
	}
	get _date_comment() {
		return this.date_comment!;
	}

	set _deleted_comment(deleted_comment: boolean) {
		this.deleted_comment = deleted_comment;
	}
	get _deleted_comment() {
		return this.deleted_comment!;
	}

	/** Methods */
	create() {
		return new Promise<Comment>(async (resolve, reject) => {
			await dml_comment_create(this)
				.then((comments: Comment[]) => {
					/**
					 * Mutate response
					 */
					const _comments = this.mutateResponse(comments);

					resolve(_comments[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Comment[]>(async (resolve, reject) => {
			await view_comment(this)
				.then((comments: Comment[]) => {
					/**
					 * Mutate response
					 */
					const _comments = this.mutateResponse(comments);

					resolve(_comments);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Comment>(async (resolve, reject) => {
			await view_comment_specific_read(this)
				.then((comments: Comment[]) => {
					/**
					 * Mutate response
					 */
					const _comments = this.mutateResponse(comments);

					resolve(_comments[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byUserTaskRead() {
		return new Promise<Comment[]>(async (resolve, reject) => {
			await view_comment_by_user_task_read(this)
				.then((comments: Comment[]) => {
					/**
					 * Mutate response
					 */
					const _comments = this.mutateResponse(comments);

					resolve(_comments);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Comment>(async (resolve, reject) => {
			await dml_comment_update(this)
				.then((comments: Comment[]) => {
					/**
					 * Mutate response
					 */
					const _comments = this.mutateResponse(comments);

					resolve(_comments[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_comment_delete(this)
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
	 * @param comments
	 * @returns
	 */
	private mutateResponse(comments: Comment[]): Comment[] {
		let _comments: Comment[] = [];

		comments.map((item: any) => {
			let _comment: Comment | any = {
				...item,
				user_task: {
					id_user_task: item.id_user_task,
					user: {
						id_user: item.id_user,
					},
					task: {
						id_task: item.id_task,
					},
					response_user_task: item.response_user_task,
					shipping_date_user_task: item.shipping_date_user_task,
					qualification_user_task: item.qualification_user_task,
					is_open: item.is_open,
					is_dispatched: item.is_dispatched,
					is_qualified: item.is_qualified,
				},
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
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _comment.id_user_task;
			delete _comment.id_user;
			delete _comment.id_task;
			delete _comment.response_user_task;
			delete _comment.shipping_date_user_task;
			delete _comment.qualification_user_task;
			delete _comment.is_open;
			delete _comment.is_dispatched;
			delete _comment.is_qualified;

			delete _comment.id_user;
			delete _comment.id_profile;
			delete _comment.type_user;
			delete _comment.name_user;
			delete _comment.password_user;
			delete _comment.avatar_user;
			delete _comment.status_user;

			delete _comment.id_person;
			delete _comment.id_academic;
			delete _comment.id_job;
			delete _comment.dni_person;
			delete _comment.name_person;
			delete _comment.last_name_person;
			delete _comment.address_person;
			delete _comment.phone_person;

			_comments.push(_comment);
		});

		return _comments;
	}
}
