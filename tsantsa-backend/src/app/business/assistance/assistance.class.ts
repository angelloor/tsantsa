import path from 'path';
import { generateRandomNumber } from '../../../utils/global';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { User } from '../../core/user/user.class';
import { _user } from '../../core/user/user.data';
import { Report } from '../../report/report.class';
import { reportAssistanceByUserAndCourse } from '../../report/report.declarate';
import { Course } from '../course/course.class';
import { _course } from '../course/course.data';
import {
	dml_assistance_create,
	dml_assistance_delete,
	dml_assistance_update,
	view_assistance,
	view_assistance_by_course_read,
	view_assistance_by_user_and_course_read,
	view_assistance_by_user_read,
	view_assistance_specific_read,
} from './assistance.store';

export class Assistance {
	/** Attributes */
	public id_user_?: number;
	public id_assistance: number;
	public user: User;
	public course: Course;
	public start_marking_date?: string;
	public end_marking_date?: string;
	public is_late?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_assistance: number = 0,
		user: User = _user,
		course: Course = _course,
		start_marking_date: string = '',
		end_marking_date: string = '',
		is_late: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_assistance = id_assistance;
		this.user = user;
		this.course = course;
		this.start_marking_date = start_marking_date;
		this.end_marking_date = end_marking_date;
		this.is_late = is_late;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_assistance(id_assistance: number) {
		this.id_assistance = id_assistance;
	}
	get _id_assistance() {
		return this.id_assistance;
	}

	set _user(user: User) {
		this.user = user;
	}
	get _user() {
		return this.user;
	}

	set _course(course: Course) {
		this.course = course;
	}
	get _course() {
		return this.course;
	}

	set _start_marking_date(start_marking_date: string) {
		this.start_marking_date = start_marking_date;
	}
	get _start_marking_date() {
		return this.start_marking_date!;
	}

	set _end_marking_date(end_marking_date: string) {
		this.end_marking_date = end_marking_date;
	}
	get _end_marking_date() {
		return this.end_marking_date!;
	}

	set _is_late(is_late: boolean) {
		this.is_late = is_late;
	}
	get _is_late() {
		return this.is_late!;
	}

	/** Methods */
	create() {
		return new Promise<Assistance>(async (resolve, reject) => {
			await dml_assistance_create(this)
				.then((assistances: Assistance[]) => {
					/**
					 * Mutate response
					 */
					const _assistances = this.mutateResponse(assistances);

					resolve(_assistances[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Assistance[]>(async (resolve, reject) => {
			await view_assistance(this)
				.then((assistances: Assistance[]) => {
					/**
					 * Mutate response
					 */
					const _assistances = this.mutateResponse(assistances);

					resolve(_assistances);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Assistance>(async (resolve, reject) => {
			await view_assistance_specific_read(this)
				.then((assistances: Assistance[]) => {
					/**
					 * Mutate response
					 */
					const _assistances = this.mutateResponse(assistances);

					resolve(_assistances[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byUserRead() {
		return new Promise<Assistance[]>(async (resolve, reject) => {
			await view_assistance_by_user_read(this)
				.then((assistances: Assistance[]) => {
					/**
					 * Mutate response
					 */
					const _assistances = this.mutateResponse(assistances);

					resolve(_assistances);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byCourseRead() {
		return new Promise<Assistance[]>(async (resolve, reject) => {
			await view_assistance_by_course_read(this)
				.then((assistances: Assistance[]) => {
					/**
					 * Mutate response
					 */
					const _assistances = this.mutateResponse(assistances);

					resolve(_assistances);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byUserAndCourseRead() {
		return new Promise<Assistance[]>(async (resolve, reject) => {
			await view_assistance_by_user_and_course_read(this)
				.then((assistances: Assistance[]) => {
					/**
					 * Mutate response
					 */
					const _assistances = this.mutateResponse(assistances);

					resolve(_assistances);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Assistance>(async (resolve, reject) => {
			await dml_assistance_update(this)
				.then((assistances: Assistance[]) => {
					/**
					 * Mutate response
					 */
					const _assistances = this.mutateResponse(assistances);

					resolve(_assistances[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_assistance_delete(this)
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
	reportAssistanceByUserAndCourse() {
		return new Promise<any>(async (resolve, reject) => {
			await view_assistance_by_user_and_course_read(this)
				.then(async (assistances: Assistance[]) => {
					if (assistances.length > 0) {
						/**
						 * Mutate response
						 */
						const _assistances = this.mutateResponse(assistances);

						const name_report = `report${generateRandomNumber(9)}`;

						const pathFinal = `${path.resolve(
							'./'
						)}/file_store/report/${name_report}.pdf`;
						/**
						 * Generar html
						 */
						const html = await reportAssistanceByUserAndCourse(_assistances);
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
	 * @param assistances
	 * @returns
	 */
	private mutateResponse(assistances: Assistance[]): Assistance[] {
		let _assistances: Assistance[] = [];

		assistances.map((item: any) => {
			let _assistance: Assistance | any = {
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
						start_date_schedule: item.start_date_schedule,
						end_date_schedule: item.end_date_schedule,
						tolerance_schedule: item.tolerance_schedule,
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
			delete _assistance.id_course;
			delete _assistance.id_period;
			delete _assistance.id_career;
			delete _assistance.name_course;
			delete _assistance.description_course;
			delete _assistance.status_course;
			delete _assistance.creation_date_course;

			delete _assistance.id_schedule;
			delete _assistance.start_date_schedule;
			delete _assistance.end_date_schedule;
			delete _assistance.tolerance_schedule;

			delete _assistance.id_user;
			delete _assistance.id_person;
			delete _assistance.id_academic;
			delete _assistance.id_job;
			delete _assistance.dni_person;
			delete _assistance.name_person;
			delete _assistance.last_name_person;
			delete _assistance.address_person;
			delete _assistance.phone_person;
			delete _assistance.id_profile;
			delete _assistance.type_user;
			delete _assistance.name_user;
			delete _assistance.password_user;
			delete _assistance.avatar_user;
			delete _assistance.status_user;

			_assistances.push(_assistance);
		});

		return _assistances;
	}
}
