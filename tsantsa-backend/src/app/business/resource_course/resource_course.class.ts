import { User } from '../../core/user/user.class';
import { _user } from '../../core/user/user.data';
import { Course } from '../course/course.class';
import { _course } from '../course/course.data';
import {
	dml_resource_course_create,
	dml_resource_course_delete,
	view_resource_course,
	view_resource_course_by_course_read,
	view_resource_course_specific_read,
} from './resource_course.store';

export class ResourceCourse {
	/** Attributes */
	public id_user_?: number;
	public id_resource_course: number;
	public course: Course;
	public user: User;
	public file_name?: string;
	public length_mb?: string;
	public extension?: string;
	public server_path?: string;
	public upload_date?: string;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_resource_course: number = 0,
		course: Course = _course,
		user: User = _user,
		file_name: string = '',
		length_mb: string = '',
		extension: string = '',
		server_path: string = '',
		upload_date: string = ''
	) {
		this.id_user_ = id_user_;
		this.id_resource_course = id_resource_course;
		this.course = course;
		this.user = user;
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

	set _id_resource_course(id_resource_course: number) {
		this.id_resource_course = id_resource_course;
	}
	get _id_resource_course() {
		return this.id_resource_course;
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
		return new Promise<ResourceCourse>(async (resolve, reject) => {
			await dml_resource_course_create(this)
				.then((resourceCourses: ResourceCourse[]) => {
					/**
					 * Mutate response
					 */
					const _resourceCourses = this.mutateResponse(resourceCourses);

					resolve(_resourceCourses[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<ResourceCourse[]>(async (resolve, reject) => {
			await view_resource_course(this)
				.then((resourceCourses: ResourceCourse[]) => {
					/**
					 * Mutate response
					 */
					const _resourceCourses = this.mutateResponse(resourceCourses);

					resolve(_resourceCourses);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<ResourceCourse>(async (resolve, reject) => {
			await view_resource_course_specific_read(this)
				.then((resourceCourses: ResourceCourse[]) => {
					/**
					 * Mutate response
					 */
					const _resourceCourses = this.mutateResponse(resourceCourses);

					resolve(_resourceCourses[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byCourseRead() {
		return new Promise<ResourceCourse[]>(async (resolve, reject) => {
			await view_resource_course_by_course_read(this)
				.then((resourceCourses: ResourceCourse[]) => {
					/**
					 * Mutate response
					 */
					const _resourceCourses = this.mutateResponse(resourceCourses);

					resolve(_resourceCourses);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_resource_course_delete(this)
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
	 * @param resourceCourses
	 * @returns
	 */
	private mutateResponse(resourceCourses: ResourceCourse[]): ResourceCourse[] {
		let _resourceCourses: ResourceCourse[] = [];

		resourceCourses.map((item: any) => {
			let _resourceCourse: ResourceCourse | any = {
				...item,
				course: {
					id_course: item.id_course,
					company: {
						id_company: item.id_company,
					},
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
				},
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _resourceCourse.id_course;
			delete _resourceCourse.id_company;
			delete _resourceCourse.id_period;
			delete _resourceCourse.id_career;
			delete _resourceCourse.id_schedule;
			delete _resourceCourse.name_course;
			delete _resourceCourse.description_course;
			delete _resourceCourse.status_course;
			delete _resourceCourse.creation_date_course;
			delete _resourceCourse.id_user;

			_resourceCourses.push(_resourceCourse);
		});

		return _resourceCourses;
	}
}
