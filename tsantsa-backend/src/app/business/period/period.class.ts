import path from 'path';
import { generateRandomNumber } from '../../../utils/global';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Company } from '../../core/company/company.class';
import { _company } from '../../core/company/company.data';
import { Report } from '../../report/report.class';
import { reportPeriod } from '../../report/report.declarate';
import {
	dml_period_create,
	dml_period_delete,
	dml_period_update,
	view_period,
	view_period_specific_read,
} from './period.store';

export class Period {
	/** Attributes */
	public id_user_?: number;
	public id_period: number;
	public company: Company;
	public name_period?: string;
	public description_period?: string;
	public start_date_period?: string;
	public end_date_period?: string;
	public maximum_rating?: number;
	public approval_note_period?: number;
	public deleted_period?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_period: number = 0,
		company: Company = _company,
		name_period: string = '',
		description_period: string = '',
		start_date_period: string = '',
		end_date_period: string = '',
		maximum_rating: number = 0,
		approval_note_period: number = 0,
		deleted_period: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_period = id_period;
		this.company = company;
		this.name_period = name_period;
		this.description_period = description_period;
		this.start_date_period = start_date_period;
		this.end_date_period = end_date_period;
		this.maximum_rating = maximum_rating;
		this.approval_note_period = approval_note_period;
		this.deleted_period = deleted_period;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_period(id_period: number) {
		this.id_period = id_period;
	}
	get _id_period() {
		return this.id_period;
	}

	set _company(company: Company) {
		this.company = company;
	}
	get _company() {
		return this.company;
	}

	set _name_period(name_period: string) {
		this.name_period = name_period;
	}
	get _name_period() {
		return this.name_period!;
	}

	set _description_period(description_period: string) {
		this.description_period = description_period;
	}
	get _description_period() {
		return this.description_period!;
	}

	set _start_date_period(start_date_period: string) {
		this.start_date_period = start_date_period;
	}
	get _start_date_period() {
		return this.start_date_period!;
	}

	set _end_date_period(end_date_period: string) {
		this.end_date_period = end_date_period;
	}
	get _end_date_period() {
		return this.end_date_period!;
	}

	set _maximum_rating(maximum_rating: number) {
		this.maximum_rating = maximum_rating;
	}
	get _maximum_rating() {
		return this.maximum_rating!;
	}

	set _approval_note_period(approval_note_period: number) {
		this.approval_note_period = approval_note_period;
	}
	get _approval_note_period() {
		return this.approval_note_period!;
	}

	set _deleted_period(deleted_period: boolean) {
		this.deleted_period = deleted_period;
	}
	get _deleted_period() {
		return this.deleted_period!;
	}

	/** Methods */
	create() {
		return new Promise<Period>(async (resolve, reject) => {
			await dml_period_create(this)
				.then((periods: Period[]) => {
					/**
					 * Mutate response
					 */
					const _periods = this.mutateResponse(periods);

					resolve(_periods[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read(id_company: string) {
		return new Promise<Period[]>(async (resolve, reject) => {
			await view_period(this, id_company)
				.then((periods: Period[]) => {
					/**
					 * Mutate response
					 */
					const _periods = this.mutateResponse(periods);

					resolve(_periods);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead(id_company: string) {
		return new Promise<Period>(async (resolve, reject) => {
			await view_period_specific_read(this, id_company)
				.then((periods: Period[]) => {
					/**
					 * Mutate response
					 */
					const _periods = this.mutateResponse(periods);

					resolve(_periods[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Period>(async (resolve, reject) => {
			await dml_period_update(this)
				.then((periods: Period[]) => {
					/**
					 * Mutate response
					 */
					const _periods = this.mutateResponse(periods);

					resolve(_periods[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_period_delete(this)
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
	reportPeriod(id_company: string) {
		return new Promise<any>(async (resolve, reject) => {
			await view_period(this, id_company)
				.then(async (periods: Period[]) => {
					if (periods.length > 0) {
						/**
						 * Mutate response
						 */
						const _periods = this.mutateResponse(periods);

						const name_report = `report${generateRandomNumber(9)}`;

						const pathFinal = `${path.resolve(
							'./'
						)}/file_store/report/${name_report}.pdf`;
						/**
						 * Generar html
						 */
						const html = await reportPeriod(_periods);
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
	 * @param periods
	 * @returns
	 */
	private mutateResponse(periods: Period[]): Period[] {
		let _periods: Period[] = [];

		periods.map((item: any) => {
			let _period: Period | any = {
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
			delete _period.id_company;
			delete _period.name_company;
			delete _period.acronym_company;
			delete _period.address_company;
			delete _period.status_company;

			_periods.push(_period);
		});

		return _periods;
	}
}
