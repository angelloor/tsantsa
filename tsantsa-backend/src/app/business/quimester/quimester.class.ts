import { Period } from '../period/period.class';
import { _period } from '../period/period.data';
import {
	dml_quimester_create,
	dml_quimester_delete,
	dml_quimester_update,
	view_quimester,
	view_quimester_by_period_read,
	view_quimester_specific_read,
} from './quimester.store';

export class Quimester {
	/** Attributes */
	public id_user_?: number;
	public id_quimester: number;
	public period: Period;
	public name_quimester?: string;
	public description_quimester?: string;
	public deleted_quimester?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_quimester: number = 0,
		period: Period = _period,
		name_quimester: string = '',
		description_quimester: string = '',
		deleted_quimester: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_quimester = id_quimester;
		this.period = period;
		this.name_quimester = name_quimester;
		this.description_quimester = description_quimester;
		this.deleted_quimester = deleted_quimester;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_quimester(id_quimester: number) {
		this.id_quimester = id_quimester;
	}
	get _id_quimester() {
		return this.id_quimester;
	}

	set _period(period: Period) {
		this.period = period;
	}
	get _period() {
		return this.period;
	}

	set _name_quimester(name_quimester: string) {
		this.name_quimester = name_quimester;
	}
	get _name_quimester() {
		return this.name_quimester!;
	}

	set _description_quimester(description_quimester: string) {
		this.description_quimester = description_quimester;
	}
	get _description_quimester() {
		return this.description_quimester!;
	}

	set _deleted_quimester(deleted_quimester: boolean) {
		this.deleted_quimester = deleted_quimester;
	}
	get _deleted_quimester() {
		return this.deleted_quimester!;
	}

	/** Methods */
	create() {
		return new Promise<Quimester>(async (resolve, reject) => {
			await dml_quimester_create(this)
				.then((quimesters: Quimester[]) => {
					/**
					 * Mutate response
					 */
					const _quimesters = this.mutateResponse(quimesters);

					resolve(_quimesters[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Quimester[]>(async (resolve, reject) => {
			await view_quimester(this)
				.then((quimesters: Quimester[]) => {
					/**
					 * Mutate response
					 */
					const _quimesters = this.mutateResponse(quimesters);

					resolve(_quimesters);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Quimester>(async (resolve, reject) => {
			await view_quimester_specific_read(this)
				.then((quimesters: Quimester[]) => {
					/**
					 * Mutate response
					 */
					const _quimesters = this.mutateResponse(quimesters);

					resolve(_quimesters[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byPeriodRead() {
		return new Promise<Quimester[]>(async (resolve, reject) => {
			await view_quimester_by_period_read(this)
				.then((quimesters: Quimester[]) => {
					/**
					 * Mutate response
					 */
					const _quimesters = this.mutateResponse(quimesters);

					resolve(_quimesters);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Quimester>(async (resolve, reject) => {
			await dml_quimester_update(this)
				.then((quimesters: Quimester[]) => {
					/**
					 * Mutate response
					 */
					const _quimesters = this.mutateResponse(quimesters);

					resolve(_quimesters[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_quimester_delete(this)
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
	 * @param quimesters
	 * @returns
	 */
	private mutateResponse(quimesters: Quimester[]): Quimester[] {
		let _quimesters: Quimester[] = [];

		quimesters.map((item: any) => {
			let _quimester: Quimester | any = {
				...item,
				period: {
					id_period: item.id_period,
					company: {
						id_company: item.id_company,
					},
					name_period: item.name_period,
					description_period: item.description_period,
					start_date_period: item.start_date_period,
					end_date_period: item.end_date_period,
					maximum_rating: item.maximum_rating,
					approval_note_period: item.approval_note_period,
				},
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _quimester.id_period;
			delete _quimester.id_company;
			delete _quimester.name_period;
			delete _quimester.description_period;
			delete _quimester.start_date_period;
			delete _quimester.end_date_period;
			delete _quimester.maximum_rating;
			delete _quimester.approval_note_period;

			_quimesters.push(_quimester);
		});

		return _quimesters;
	}
}
