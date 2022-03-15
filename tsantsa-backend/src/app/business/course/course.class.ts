import { Company } from '../../core/company/company.class';
import { _company } from '../../core/company/company.data';
import { Career } from '../career/career.class';
import { _career } from '../career/career.data';
import { Period } from '../period/period.class';
import { _period } from '../period/period.data';
import {
	dml_course_create,
	dml_course_delete,
	dml_course_update,
	view_course,
	view_course_specific_read,
} from './course.store';
import { Schedule } from './schedule/schedule.class';
import { _schedule } from './schedule/schedule.data';

export class Course {
	/** Attributes */
	public id_user_?: number;
	public id_course: number;
	public company: Company;
	public period: Period;
	public career: Career;
	public schedule: Schedule;
	public name_course?: string;
	public description_course?: string;
	public status_course?: boolean;
	public creation_date_course?: string;
	public deleted_course?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_course: number = 0,
		company: Company = _company,
		period: Period = _period,
		career: Career = _career,
		schedule: Schedule = _schedule,
		name_course: string = '',
		description_course: string = '',
		status_course: boolean = false,
		creation_date_course: string = '',
		deleted_course: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_course = id_course;
		this.company = company;
		this.period = period;
		this.career = career;
		this.schedule = schedule;
		this.name_course = name_course;
		this.description_course = description_course;
		this.status_course = status_course;
		this.creation_date_course = creation_date_course;
		this.deleted_course = deleted_course;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_course(id_course: number) {
		this.id_course = id_course;
	}
	get _id_course() {
		return this.id_course;
	}

	set _company(company: Company) {
		this.company = company;
	}
	get _company() {
		return this.company;
	}

	set _period(period: Period) {
		this.period = period;
	}
	get _period() {
		return this.period;
	}

	set _career(career: Career) {
		this.career = career;
	}
	get _career() {
		return this.career;
	}

	set _schedule(schedule: Schedule) {
		this.schedule = schedule;
	}
	get _schedule() {
		return this.schedule;
	}

	set _name_course(name_course: string) {
		this.name_course = name_course;
	}
	get _name_course() {
		return this.name_course!;
	}

	set _description_course(description_course: string) {
		this.description_course = description_course;
	}
	get _description_course() {
		return this.description_course!;
	}

	set _status_course(status_course: boolean) {
		this.status_course = status_course;
	}
	get _status_course() {
		return this.status_course!;
	}

	set _creation_date_course(creation_date_course: string) {
		this.creation_date_course = creation_date_course;
	}
	get _creation_date_course() {
		return this.creation_date_course!;
	}

	set _deleted_course(deleted_course: boolean) {
		this.deleted_course = deleted_course;
	}
	get _deleted_course() {
		return this.deleted_course!;
	}

	/** Methods */
	create() {
		return new Promise<Course>(async (resolve, reject) => {
			await dml_course_create(this)
				.then((courses: Course[]) => {
					/**
					 * Mutate response
					 */
					const _courses = this.mutateResponse(courses);

					resolve(_courses[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Course[]>(async (resolve, reject) => {
			await view_course(this)
				.then((courses: Course[]) => {
					/**
					 * Mutate response
					 */
					const _courses = this.mutateResponse(courses);

					resolve(_courses);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Course>(async (resolve, reject) => {
			await view_course_specific_read(this)
				.then((courses: Course[]) => {
					/**
					 * Mutate response
					 */
					const _courses = this.mutateResponse(courses);

					resolve(_courses[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Course>(async (resolve, reject) => {
			await dml_course_update(this)
				.then((courses: Course[]) => {
					/**
					 * Mutate response
					 */
					const _courses = this.mutateResponse(courses);

					resolve(_courses[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_course_delete(this)
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
	 * @param courses
	 * @returns
	 */
	private mutateResponse(courses: Course[]): Course[] {
		let _courses: Course[] = [];

		courses.map((item: any) => {
			let _course: Course | any = {
				...item,
				company: {
					id_company: item.id_company,
					name_company: item.name_company,
					acronym_company: item.acronym_company,
					address_company: item.address_company,
					status_company: item.status_company,
				},
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
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _course.id_company;
			delete _course.name_company;
			delete _course.acronym_company;
			delete _course.address_company;
			delete _course.status_company;

			delete _course.id_period;
			delete _course.name_period;
			delete _course.description_period;
			delete _course.start_date_period;
			delete _course.end_date_period;
			delete _course.maximum_rating;
			delete _course.approval_note_period;

			delete _course.id_career;
			delete _course.name_career;
			delete _course.description_career;
			delete _course.status_career;
			delete _course.creation_date_career;

			delete _course.id_schedule;
			delete _course.start_date_schedule;
			delete _course.end_date_schedule;
			delete _course.tolerance_schedule;
			delete _course.creation_date_schedule;

			_courses.push(_course);
		});

		return _courses;
	}
}
