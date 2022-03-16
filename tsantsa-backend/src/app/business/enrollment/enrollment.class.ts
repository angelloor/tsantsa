import { User } from '../../core/user/user.class';
import { _user } from '../../core/user/user.data';
import { Course } from '../course/course.class';
import { _course } from '../course/course.data';
import {
	dml_enrollment_create,
	dml_enrollment_delete,
	dml_enrollment_update,
	view_enrollment,
	view_enrollment_by_course_read,
	view_enrollment_by_user_read,
	view_enrollment_specific_read,
} from './enrollment.store';

export class Enrollment {
	/** Attributes */
	public id_user_?: number;
	public id_enrollment: number;
	public course: Course;
	public user: User;
	public date_enrollment?: string;
	public status_enrollment?: boolean;
	public completed_course?: boolean;
	public deleted_enrollment?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_enrollment: number = 0,
		course: Course = _course,
		user: User = _user,
		date_enrollment: string = '',
		status_enrollment: boolean = false,
		completed_course: boolean = false,
		deleted_enrollment: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_enrollment = id_enrollment;
		this.course = course;
		this.user = user;
		this.date_enrollment = date_enrollment;
		this.status_enrollment = status_enrollment;
		this.completed_course = completed_course;
		this.deleted_enrollment = deleted_enrollment;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_enrollment(id_enrollment: number) {
		this.id_enrollment = id_enrollment;
	}
	get _id_enrollment() {
		return this.id_enrollment;
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

	set _date_enrollment(date_enrollment: string) {
		this.date_enrollment = date_enrollment;
	}
	get _date_enrollment() {
		return this.date_enrollment!;
	}

	set _status_enrollment(status_enrollment: boolean) {
		this.status_enrollment = status_enrollment;
	}
	get _status_enrollment() {
		return this.status_enrollment!;
	}

	set _completed_course(completed_course: boolean) {
		this.completed_course = completed_course;
	}
	get _completed_course() {
		return this.completed_course!;
	}

	set _deleted_enrollment(deleted_enrollment: boolean) {
		this.deleted_enrollment = deleted_enrollment;
	}
	get _deleted_enrollment() {
		return this.deleted_enrollment!;
	}

	/** Methods */
	create() {
		return new Promise<Enrollment>(async (resolve, reject) => {
			await dml_enrollment_create(this)
				.then((enrollments: Enrollment[]) => {
					/**
					 * Mutate response
					 */
					const _enrollments = this.mutateResponse(enrollments);

					resolve(_enrollments[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Enrollment[]>(async (resolve, reject) => {
			await view_enrollment(this)
				.then((enrollments: Enrollment[]) => {
					/**
					 * Mutate response
					 */
					const _enrollments = this.mutateResponse(enrollments);

					resolve(_enrollments);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Enrollment>(async (resolve, reject) => {
			await view_enrollment_specific_read(this)
				.then((enrollments: Enrollment[]) => {
					/**
					 * Mutate response
					 */
					const _enrollments = this.mutateResponse(enrollments);

					resolve(_enrollments[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byCourseRead() {
		return new Promise<Enrollment[]>(async (resolve, reject) => {
			await view_enrollment_by_course_read(this)
				.then((enrollments: Enrollment[]) => {
					/**
					 * Mutate response
					 */
					const _enrollments = this.mutateResponse(enrollments);

					resolve(_enrollments);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byUserRead() {
		return new Promise<Enrollment[]>(async (resolve, reject) => {
			await view_enrollment_by_user_read(this)
				.then((enrollments: Enrollment[]) => {
					/**
					 * Mutate response
					 */
					const _enrollments = this.mutateResponse(enrollments);

					resolve(_enrollments);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Enrollment>(async (resolve, reject) => {
			await dml_enrollment_update(this)
				.then((enrollments: Enrollment[]) => {
					/**
					 * Mutate response
					 */
					const _enrollments = this.mutateResponse(enrollments);

					resolve(_enrollments[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_enrollment_delete(this)
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
	 * @param enrollments
	 * @returns
	 */
	private mutateResponse(enrollments: Enrollment[]): Enrollment[] {
		let _enrollments: Enrollment[] = [];

		enrollments.map((item: any) => {
			let _enrollment: Enrollment | any = {
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
			delete _enrollment.id_course;
			delete _enrollment.name_course;
			delete _enrollment.description_course;
			delete _enrollment.status_course;
			delete _enrollment.creation_date_course;

			delete _enrollment.id_period;
			delete _enrollment.name_period;
			delete _enrollment.description_period;
			delete _enrollment.start_date_period;
			delete _enrollment.end_date_period;
			delete _enrollment.maximum_rating;
			delete _enrollment.approval_note_period;

			delete _enrollment.id_career;
			delete _enrollment.name_career;
			delete _enrollment.description_career;
			delete _enrollment.status_career;
			delete _enrollment.creation_date_career;

			delete _enrollment.id_schedule;
			delete _enrollment.start_date_schedule;
			delete _enrollment.end_date_schedule;
			delete _enrollment.tolerance_schedule;
			delete _enrollment.creation_date_schedule;

			delete _enrollment.id_user;
			delete _enrollment.id_person;
			delete _enrollment.id_academic;
			delete _enrollment.id_job;
			delete _enrollment.dni_person;
			delete _enrollment.name_person;
			delete _enrollment.last_name_person;
			delete _enrollment.address_person;
			delete _enrollment.phone_person;
			delete _enrollment.id_profile;
			delete _enrollment.type_user;
			delete _enrollment.name_user;
			delete _enrollment.password_user;
			delete _enrollment.avatar_user;
			delete _enrollment.status_user;

			_enrollments.push(_enrollment);
		});

		return _enrollments;
	}
}
