import { User } from '../../core/user/user.class';
import { _user } from '../../core/user/user.data';
import { Forum } from '../forum/forum.class';
import { _forum } from '../forum/forum.data';
import {
	dml_comment_forum_create,
	dml_comment_forum_delete,
	dml_comment_forum_update,
	view_comment_forum,
	view_comment_forum_by_forum_read,
	view_comment_forum_specific_read,
} from './comment_forum.store';

export class CommentForum {
	/** Attributes */
	public id_user_?: number;
	public id_comment_forum: number;
	public forum: Forum;
	public user: User;
	public value_comment_forum?: string;
	public date_comment_forum?: string;
	public deleted_comment_forum?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_comment_forum: number = 0,
		forum: Forum = _forum,
		user: User = _user,
		value_comment_forum: string = '',
		date_comment_forum: string = '',
		deleted_comment_forum: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_comment_forum = id_comment_forum;
		this.forum = forum;
		this.user = user;
		this.value_comment_forum = value_comment_forum;
		this.date_comment_forum = date_comment_forum;
		this.deleted_comment_forum = deleted_comment_forum;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_comment_forum(id_comment_forum: number) {
		this.id_comment_forum = id_comment_forum;
	}
	get _id_comment_forum() {
		return this.id_comment_forum;
	}

	set _forum(forum: Forum) {
		this.forum = forum;
	}
	get _forum() {
		return this.forum;
	}

	set _user(user: User) {
		this.user = user;
	}
	get _user() {
		return this.user;
	}

	set _value_comment_forum(value_comment_forum: string) {
		this.value_comment_forum = value_comment_forum;
	}
	get _value_comment_forum() {
		return this.value_comment_forum!;
	}

	set _date_comment_forum(date_comment_forum: string) {
		this.date_comment_forum = date_comment_forum;
	}
	get _date_comment_forum() {
		return this.date_comment_forum!;
	}

	set _deleted_comment_forum(deleted_comment_forum: boolean) {
		this.deleted_comment_forum = deleted_comment_forum;
	}
	get _deleted_comment_forum() {
		return this.deleted_comment_forum!;
	}

	/** Methods */
	create() {
		return new Promise<CommentForum>(async (resolve, reject) => {
			await dml_comment_forum_create(this)
				.then((commentForums: CommentForum[]) => {
					/**
					 * Mutate response
					 */
					const _commentForums = this.mutateResponse(commentForums);

					resolve(_commentForums[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<CommentForum[]>(async (resolve, reject) => {
			await view_comment_forum(this)
				.then((commentForums: CommentForum[]) => {
					/**
					 * Mutate response
					 */
					const _commentForums = this.mutateResponse(commentForums);

					resolve(_commentForums);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<CommentForum>(async (resolve, reject) => {
			await view_comment_forum_specific_read(this)
				.then((commentForums: CommentForum[]) => {
					/**
					 * Mutate response
					 */
					const _commentForums = this.mutateResponse(commentForums);

					resolve(_commentForums[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byForumRead() {
		return new Promise<CommentForum[]>(async (resolve, reject) => {
			await view_comment_forum_by_forum_read(this)
				.then((commentForums: CommentForum[]) => {
					/**
					 * Mutate response
					 */
					const _commentForums = this.mutateResponse(commentForums);

					resolve(_commentForums);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<CommentForum>(async (resolve, reject) => {
			await dml_comment_forum_update(this)
				.then((commentForums: CommentForum[]) => {
					/**
					 * Mutate response
					 */
					const _commentForums = this.mutateResponse(commentForums);

					resolve(_commentForums[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_comment_forum_delete(this)
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
	 * @param commentForums
	 * @returns
	 */
	private mutateResponse(commentForums: CommentForum[]): CommentForum[] {
		let _commentForums: CommentForum[] = [];

		commentForums.map((item: any) => {
			let _commentForum: CommentForum | any = {
				...item,
				forum: {
					id_forum: item.id_forum,
					course: {
						id_course: item.id_course,
					},
					title_forum: item.title_forum,
					description_forum: item.description_forum,
					date_forum: item.date_forum,
				},
				user: {
					id_user: item.id_user,
					company: {
						id_company: item.id_company,
					},
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
			delete _commentForum.id_forum;
			delete _commentForum.id_course;
			delete _commentForum.title_forum;
			delete _commentForum.description_forum;
			delete _commentForum.date_forum;
			delete _commentForum.id_company;
			delete _commentForum.id_person;
			delete _commentForum.id_academic;
			delete _commentForum.id_job;
			delete _commentForum.dni_person;
			delete _commentForum.name_person;
			delete _commentForum.last_name_person;
			delete _commentForum.address_person;
			delete _commentForum.phone_person;
			delete _commentForum.id_user;
			delete _commentForum.id_profile;
			delete _commentForum.type_user;
			delete _commentForum.name_user;
			delete _commentForum.password_user;
			delete _commentForum.avatar_user;
			delete _commentForum.status_user;
			_commentForums.push(_commentForum);
		});

		return _commentForums;
	}
}
