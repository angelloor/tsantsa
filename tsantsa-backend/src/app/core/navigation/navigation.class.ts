import { Company } from '../company/company.class';
import { _company } from '../company/company.data';
import {
	dml_navigation_create,
	dml_navigation_delete,
	dml_navigation_update,
	view_navigation,
	view_navigation_specific_read,
} from './navigation.store';

export class Navigation {
	/** Attributes */
	public id_user_?: number;
	public id_navigation: number;
	public company: Company;
	public name_navigation?: string;
	public description_navigation?: string;
	public type_navigation?: string;
	public status_navigation?: boolean;
	public content_navigation?: string;
	public deleted_navigation?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_navigation: number = 0,
		company: Company = _company,
		name_navigation: string = '',
		description_navigation: string = '',
		type_navigation: string = '',
		status_navigation: boolean = false,
		content_navigation: string = '',
		deleted_navigation: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_navigation = id_navigation;
		this.company = company;
		this.name_navigation = name_navigation;
		this.description_navigation = description_navigation;
		this.type_navigation = type_navigation;
		this.status_navigation = status_navigation;
		this.content_navigation = content_navigation;
		this.deleted_navigation = deleted_navigation;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_navigation(id_navigation: number) {
		this.id_navigation = id_navigation;
	}
	get _id_navigation() {
		return this.id_navigation;
	}

	set _company(company: Company) {
		this.company = company;
	}
	get _company() {
		return this.company!;
	}

	set _name_navigation(name_navigation: string) {
		this.name_navigation = name_navigation;
	}
	get _name_navigation() {
		return this.name_navigation!;
	}

	set _description_navigation(description_navigation: string) {
		this.description_navigation = description_navigation;
	}
	get _description_navigation() {
		return this.description_navigation!;
	}

	set _type_navigation(type_navigation: string) {
		this.type_navigation = type_navigation;
	}
	get _type_navigation() {
		return this.type_navigation!;
	}

	set _status_navigation(status_navigation: boolean) {
		this.status_navigation = status_navigation;
	}
	get _status_navigation() {
		return this.status_navigation!;
	}

	set _content_navigation(content_navigation: string) {
		this.content_navigation = content_navigation;
	}
	get _content_navigation() {
		return this.content_navigation!;
	}

	set _deleted_navigation(deleted_navigation: boolean) {
		this.deleted_navigation = deleted_navigation;
	}
	get _deleted_navigation() {
		return this.deleted_navigation!;
	}

	/** Methods */
	create() {
		return new Promise<Navigation>(async (resolve, reject) => {
			await dml_navigation_create(this)
				.then((navigations: Navigation[]) => {
					/**
					 * Mutate response
					 */
					const _validations = this.mutateResponse(navigations);

					resolve(_validations[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read(id_company: string) {
		return new Promise<Navigation[]>(async (resolve, reject) => {
			await view_navigation(this, id_company)
				.then((navigations: Navigation[]) => {
					/**
					 * Mutate response
					 */
					const _validations = this.mutateResponse(navigations);

					resolve(_validations);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead(id_company: string) {
		return new Promise<Navigation>(async (resolve, reject) => {
			await view_navigation_specific_read(this, id_company)
				.then((navigations: Navigation[]) => {
					/**
					 * Mutate response
					 */
					const _validations = this.mutateResponse(navigations);

					resolve(_validations[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Navigation>(async (resolve, reject) => {
			await dml_navigation_update(this)
				.then((navigations: Navigation[]) => {
					/**
					 * Mutate response
					 */
					const _validations = this.mutateResponse(navigations);

					resolve(_validations[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_navigation_delete(this)
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
	 * @param navigations
	 * @returns
	 */
	private mutateResponse(navigations: Navigation[]): Navigation[] {
		let _navigations: Navigation[] = [];
		navigations.map((item: any) => {
			let _navigation: Navigation | any = {
				...item,
				company: {
					id_company: item.id_company,
				},
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _navigation.id_company;

			_navigations.push(_navigation);
		});

		return _navigations;
	}
}
