import { Course } from '../course/course.class';
import { _course } from '../course/course.data';
import {
	dml_glossary_create,
	dml_glossary_delete,
	dml_glossary_update,
	view_glossary,
	view_glossary_by_course_read,
	view_glossary_specific_read,
} from './glossary.store';

export class Glossary {
	/** Attributes */
	public id_user_?: number;
	public id_glossary: number;
	public course: Course;
	public term_glossary?: string;
	public concept_glossary?: string;
	public date_glossary?: string;
	public deleted_glossary?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_glossary: number = 0,
		course: Course = _course,
		term_glossary: string = '',
		concept_glossary: string = '',
		date_glossary: string = '',
		deleted_glossary: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_glossary = id_glossary;
		this.course = course;
		this.term_glossary = term_glossary;
		this.concept_glossary = concept_glossary;
		this.date_glossary = date_glossary;
		this.deleted_glossary = deleted_glossary;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_glossary(id_glossary: number) {
		this.id_glossary = id_glossary;
	}
	get _id_glossary() {
		return this.id_glossary;
	}

	set _course(course: Course) {
		this.course = course;
	}
	get _course() {
		return this.course;
	}

	set _term_glossary(term_glossary: string) {
		this.term_glossary = term_glossary;
	}
	get _term_glossary() {
		return this.term_glossary!;
	}

	set _concept_glossary(concept_glossary: string) {
		this.concept_glossary = concept_glossary;
	}
	get _concept_glossary() {
		return this.concept_glossary!;
	}

	set _date_glossary(date_glossary: string) {
		this.date_glossary = date_glossary;
	}
	get _date_glossary() {
		return this.date_glossary!;
	}

	set _deleted_glossary(deleted_glossary: boolean) {
		this.deleted_glossary = deleted_glossary;
	}
	get _deleted_glossary() {
		return this.deleted_glossary!;
	}

	/** Methods */
	create() {
		return new Promise<Glossary>(async (resolve, reject) => {
			await dml_glossary_create(this)
				.then((glossarys: Glossary[]) => {
					/**
					 * Mutate response
					 */
					const _glossarys = this.mutateResponse(glossarys);

					resolve(_glossarys[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Glossary[]>(async (resolve, reject) => {
			await view_glossary(this)
				.then((glossarys: Glossary[]) => {
					/**
					 * Mutate response
					 */
					const _glossarys = this.mutateResponse(glossarys);

					resolve(_glossarys);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Glossary>(async (resolve, reject) => {
			await view_glossary_specific_read(this)
				.then((glossarys: Glossary[]) => {
					/**
					 * Mutate response
					 */
					const _glossarys = this.mutateResponse(glossarys);

					resolve(_glossarys[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byCourseRead() {
		return new Promise<Glossary[]>(async (resolve, reject) => {
			await view_glossary_by_course_read(this)
				.then((glossarys: Glossary[]) => {
					/**
					 * Mutate response
					 */
					const _glossarys = this.mutateResponse(glossarys);

					resolve(_glossarys);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Glossary>(async (resolve, reject) => {
			await dml_glossary_update(this)
				.then((glossarys: Glossary[]) => {
					/**
					 * Mutate response
					 */
					const _glossarys = this.mutateResponse(glossarys);

					resolve(_glossarys[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_glossary_delete(this)
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
	 * @param glossarys
	 * @returns
	 */
	private mutateResponse(glossarys: Glossary[]): Glossary[] {
		let _glossarys: Glossary[] = [];

		glossarys.map((item: any) => {
			let _glossary: Glossary | any = {
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
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _glossary.id_course;
			delete _glossary.id_company;
			delete _glossary.id_period;
			delete _glossary.id_career;
			delete _glossary.id_schedule;
			delete _glossary.name_course;
			delete _glossary.description_course;
			delete _glossary.status_course;
			delete _glossary.creation_date_course;

			_glossarys.push(_glossary);
		});

		return _glossarys;
	}
}
