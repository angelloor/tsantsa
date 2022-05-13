import { Company } from '../company/company.class';
import { _company } from '../company/company.data';
import { User } from '../user/user.class';
import { _user } from '../user/user.data';
import {
	dml_newsletter_create,
	dml_newsletter_delete,
	dml_newsletter_update,
	view_newsletter,
	view_newsletter_by_company_read,
	view_newsletter_specific_read,
} from './newsletter.store';

export class Newsletter {
	/** Attributes */
	public id_user_?: number;
	public id_newsletter: number;
	public company: Company;
	public user: User;
	public name_newsletter?: string;
	public description_newsletter?: string;
	public date_newsletter?: string;
	public deleted_newsletter?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_newsletter: number = 0,
		company: Company = _company,
		user: User = _user,
		name_newsletter: string = '',
		description_newsletter: string = '',
		date_newsletter: string = '',
		deleted_newsletter: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_newsletter = id_newsletter;
		this.company = company;
		this.user = user;
		this.name_newsletter = name_newsletter;
		this.description_newsletter = description_newsletter;
		this.date_newsletter = date_newsletter;
		this.deleted_newsletter = deleted_newsletter;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_newsletter(id_newsletter: number) {
		this.id_newsletter = id_newsletter;
	}
	get _id_newsletter() {
		return this.id_newsletter;
	}

	set _company(company: Company) {
		this.company = company;
	}
	get _company() {
		return this.company;
	}

	set _user(user: User) {
		this.user = user;
	}
	get _user() {
		return this.user;
	}

	set _name_newsletter(name_newsletter: string) {
		this.name_newsletter = name_newsletter;
	}
	get _name_newsletter() {
		return this.name_newsletter!;
	}

	set _description_newsletter(description_newsletter: string) {
		this.description_newsletter = description_newsletter;
	}
	get _description_newsletter() {
		return this.description_newsletter!;
	}

	set _date_newsletter(date_newsletter: string) {
		this.date_newsletter = date_newsletter;
	}
	get _date_newsletter() {
		return this.date_newsletter!;
	}

	set _deleted(deleted_newsletter: boolean) {
		this.deleted_newsletter = deleted_newsletter;
	}
	get _deleted() {
		return this.deleted_newsletter!;
	}

	/** Methods */
	create() {
		return new Promise<Newsletter>(async (resolve, reject) => {
			await dml_newsletter_create(this)
				.then((newsletters: Newsletter[]) => {
					/**
					 * Mutate response
					 */
					const _newsletters = this.mutateResponse(newsletters);

					resolve(_newsletters[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Newsletter[]>(async (resolve, reject) => {
			await view_newsletter(this)
				.then((newsletters: Newsletter[]) => {
					/**
					 * Mutate response
					 */
					const _newsletters = this.mutateResponse(newsletters);

					resolve(_newsletters);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Newsletter>(async (resolve, reject) => {
			await view_newsletter_specific_read(this)
				.then((newsletters: Newsletter[]) => {
					/**
					 * Mutate response
					 */
					const _newsletters = this.mutateResponse(newsletters);

					resolve(_newsletters[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byCompanyRead() {
		return new Promise<Newsletter[]>(async (resolve, reject) => {
			await view_newsletter_by_company_read(this)
				.then((newsletters: Newsletter[]) => {
					/**
					 * Mutate response
					 */
					const _newsletters = this.mutateResponse(newsletters);

					resolve(_newsletters);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Newsletter>(async (resolve, reject) => {
			await dml_newsletter_update(this)
				.then((newsletters: Newsletter[]) => {
					/**
					 * Mutate response
					 */
					const _newsletters = this.mutateResponse(newsletters);

					resolve(_newsletters[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_newsletter_delete(this)
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
	 * @param newsletters
	 * @returns
	 */
	private mutateResponse(newsletters: Newsletter[]): Newsletter[] {
		let _newsletters: Newsletter[] = [];

		newsletters.map((item: any) => {
			let _newsletter: Newsletter | any = {
				...item,
				company: {
					id_company: item.id_company,
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
			delete _newsletter.id_company;
			delete _newsletter.id_user;
			delete _newsletter.id_person;
			delete _newsletter.id_academic;
			delete _newsletter.id_job;
			delete _newsletter.dni_person;
			delete _newsletter.name_person;
			delete _newsletter.last_name_person;
			delete _newsletter.address_person;
			delete _newsletter.phone_person;
			delete _newsletter.id_profile;
			delete _newsletter.type_user;
			delete _newsletter.name_user;
			delete _newsletter.password_user;
			delete _newsletter.avatar_user;
			delete _newsletter.status_user;

			_newsletters.push(_newsletter);
		});

		return _newsletters;
	}
}
