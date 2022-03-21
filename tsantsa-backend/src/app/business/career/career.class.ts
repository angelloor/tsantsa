import path from 'path';
import { generateRandomNumber } from '../../../utils/global';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Company } from '../../core/company/company.class';
import { _company } from '../../core/company/company.data';
import { Report } from '../../report/report.class';
import { reportCareer } from '../../report/report.declarate';
import {
	dml_career_create,
	dml_career_delete,
	dml_career_update,
	view_career,
	view_career_specific_read,
} from './career.store';

export class Career {
	/** Attributes */
	public id_user_?: number;
	public id_career: number;
	public company: Company;
	public name_career?: string;
	public description_career?: string;
	public status_career?: boolean;
	public creation_date_career?: string;
	public deleted_career?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_career: number = 0,
		company: Company = _company,
		name_career: string = '',
		description_career: string = '',
		status_career: boolean = false,
		creation_date_career: string = '',
		deleted_career: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_career = id_career;
		this.company = company;
		this.name_career = name_career;
		this.description_career = description_career;
		this.status_career = status_career;
		this.creation_date_career = creation_date_career;
		this.deleted_career = deleted_career;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_career(id_career: number) {
		this.id_career = id_career;
	}
	get _id_career() {
		return this.id_career;
	}

	set _company(company: Company) {
		this.company = company;
	}
	get _company() {
		return this.company;
	}

	set _name_career(name_career: string) {
		this.name_career = name_career;
	}
	get _name_career() {
		return this.name_career!;
	}

	set _description_career(description_career: string) {
		this.description_career = description_career;
	}
	get _description_career() {
		return this.description_career!;
	}

	set _status_career(status_career: boolean) {
		this.status_career = status_career;
	}
	get _status_career() {
		return this.status_career!;
	}

	set _creation_date_career(creation_date_career: string) {
		this.creation_date_career = creation_date_career;
	}
	get _creation_date_career() {
		return this.creation_date_career!;
	}

	set _deleted_career(deleted_career: boolean) {
		this.deleted_career = deleted_career;
	}
	get _deleted_career() {
		return this.deleted_career!;
	}

	/** Methods */
	create() {
		return new Promise<Career>(async (resolve, reject) => {
			await dml_career_create(this)
				.then((careers: Career[]) => {
					/**
					 * Mutate response
					 */
					const _careers = this.mutateResponse(careers);

					resolve(_careers[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read(id_company: string) {
		return new Promise<Career[]>(async (resolve, reject) => {
			await view_career(this, id_company)
				.then((careers: Career[]) => {
					/**
					 * Mutate response
					 */
					const _careers = this.mutateResponse(careers);

					resolve(_careers);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead(id_company: string) {
		return new Promise<Career>(async (resolve, reject) => {
			await view_career_specific_read(this, id_company)
				.then((careers: Career[]) => {
					/**
					 * Mutate response
					 */
					const _careers = this.mutateResponse(careers);

					resolve(_careers[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Career>(async (resolve, reject) => {
			await dml_career_update(this)
				.then((careers: Career[]) => {
					/**
					 * Mutate response
					 */
					const _careers = this.mutateResponse(careers);

					resolve(_careers[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_career_delete(this)
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
	reportCareer(id_company: string) {
		return new Promise<any>(async (resolve, reject) => {
			await view_career(this, id_company)
				.then(async (careers: Career[]) => {
					if (careers.length > 0) {
						/**
						 * Mutate response
						 */
						const _careers = this.mutateResponse(careers);

						const name_report = `report${generateRandomNumber(9)}`;

						const pathFinal = `${path.resolve(
							'./'
						)}/file_store/report/${name_report}.pdf`;
						/**
						 * Generar html
						 */
						const html = await reportCareer(_careers);
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
	 * @param careers
	 * @returns
	 */
	private mutateResponse(careers: Career[]): Career[] {
		let _careers: Career[] = [];

		careers.map((item: any) => {
			let _career: Career | any = {
				...item,
				company: {
					id_company: item.id_company,
					name_company: item.name_company,
					acronym_company: item.acronym_company,
					address_company: item.address_company,
					status_company: item.status_company,
				},
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _career.id_company;
			delete _career.name_company;
			delete _career.acronym_company;
			delete _career.address_company;
			delete _career.status_company;

			_careers.push(_career);
		});

		return _careers;
	}
}
