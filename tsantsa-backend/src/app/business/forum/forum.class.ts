import { User } from '../../core/user/user.class';
import { _user } from '../../core/user/user.data';
import { Course } from '../course/course.class';
import { _course } from '../course/course.data';
import {
	dml_forum_create,
	dml_forum_delete,
	dml_forum_update,
	view_forum,
	view_forum_by_course_read,
	view_forum_specific_read,
} from './forum.store';

export class Forum {
	/** Attributes */
	public id_user_?: number;
	public id_forum: number;
	public course: Course;
	public user: User;
	public title_forum?: string;
	public description_forum?: string;
	public date_forum?: string;
	public deleted_forum?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_forum: number = 0,
		course: Course = _course,
		user: User = _user,
		title_forum: string = '',
		description_forum: string = '',
		date_forum: string = '',
		deleted_forum: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_forum = id_forum;
		this.course = course;
		this.user = user;
		this.title_forum = title_forum;
		this.description_forum = description_forum;
		this.date_forum = date_forum;
		this.deleted_forum = deleted_forum;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_forum(id_forum: number) {
		this.id_forum = id_forum;
	}
	get _id_forum() {
		return this.id_forum;
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

	set _title_forum(title_forum: string) {
		this.title_forum = title_forum;
	}
	get _title_forum() {
		return this.title_forum!;
	}

	set _description_forum(description_forum: string) {
		this.description_forum = description_forum;
	}
	get _description_forum() {
		return this.description_forum!;
	}

	set _date_forum(date_forum: string) {
		this.date_forum = date_forum;
	}
	get _date_forum() {
		return this.date_forum!;
	}

	set _deleted_forum(deleted_forum: boolean) {
		this.deleted_forum = deleted_forum;
	}
	get _deleted_forum() {
		return this.deleted_forum!;
	}

	/** Methods */
	create() {
		return new Promise<Forum>(async (resolve, reject) => {
			await dml_forum_create(this)
				.then((forums: Forum[]) => {
					/**
					 * Mutate response
					 */
					const _forums = this.mutateResponse(forums);

					resolve(_forums[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Forum[]>(async (resolve, reject) => {
			await view_forum(this)
				.then((forums: Forum[]) => {
					/**
					 * Mutate response
					 */
					const _forums = this.mutateResponse(forums);

					resolve(_forums);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Forum>(async (resolve, reject) => {
			await view_forum_specific_read(this)
				.then((forums: Forum[]) => {
					/**
					 * Mutate response
					 */
					const _forums = this.mutateResponse(forums);

					resolve(_forums[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byCourseRead() {
		return new Promise<Forum[]>(async (resolve, reject) => {
			await view_forum_by_course_read(this)
				.then((forums: Forum[]) => {
					/**
					 * Mutate response
					 */
					const _forums = this.mutateResponse(forums);

					resolve(_forums);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Forum>(async (resolve, reject) => {
			await dml_forum_update(this)
				.then((forums: Forum[]) => {
					/**
					 * Mutate response
					 */
					const _forums = this.mutateResponse(forums);

					resolve(_forums[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_forum_delete(this)
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
	 * @param forums
	 * @returns
	 */
	private mutateResponse(forums: Forum[]): Forum[] {
		let _forums: Forum[] = [];

		forums.map((item: any) => {
			let _forum: Forum | any = {
				...item,
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
			delete _forum.id_course;
			delete _forum.id_company;
			delete _forum.id_period;
			delete _forum.id_career;
			delete _forum.id_schedule;
			delete _forum.name_course;
			delete _forum.description_course;
			delete _forum.status_course;
			delete _forum.creation_date_course;
			delete _forum.id_company;
			delete _forum.id_person;
			delete _forum.id_academic;
			delete _forum.id_job;
			delete _forum.dni_person;
			delete _forum.name_person;
			delete _forum.last_name_person;
			delete _forum.address_person;
			delete _forum.phone_person;
			delete _forum.id_user;
			delete _forum.id_profile;
			delete _forum.type_user;
			delete _forum.name_user;
			delete _forum.password_user;
			delete _forum.avatar_user;
			delete _forum.status_user;

			_forums.push(_forum);
		});

		return _forums;
	}
}
