import { Company } from '../company/company.class';
import { _company } from '../company/company.data';
import {
	dml_profile_create,
	dml_profile_delete,
	dml_profile_update,
	view_profile,
	view_profile_specific_read,
} from './profile.store';

export class Profile {
	/** Attributes */
	public id_user_?: number;
	public id_profile: number;
	public company: Company;
	public type_profile?: string;
	public name_profile?: string;
	public description_profile?: string;
	public status_profile?: boolean;
	public deleted_profile?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_profile: number = 0,
		company: Company = _company,
		type_profile: string = '',
		name_profile: string = '',
		description_profile: string = '',
		status_profile: boolean = false,
		deleted_profile: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_profile = id_profile;
		this.company = company;
		this.type_profile = type_profile;
		this.name_profile = name_profile;
		this.description_profile = description_profile;
		this.status_profile = status_profile;
		this.deleted_profile = deleted_profile;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_profile(id_profile: number) {
		this.id_profile = id_profile;
	}
	get _id_profile() {
		return this.id_profile;
	}

	set _company(company: Company) {
		this.company = company;
	}
	get _company() {
		return this.company!;
	}

	set _type_profile(type_profile: string) {
		this.type_profile = type_profile;
	}
	get _type_profile() {
		return this.type_profile!;
	}

	set _name_profile(name_profile: string) {
		this.name_profile = name_profile;
	}
	get _name_profile() {
		return this.name_profile!;
	}

	set _description_profile(description_profile: string) {
		this.description_profile = description_profile;
	}
	get _description_profile() {
		return this.description_profile!;
	}

	set _status_profile(status_profile: boolean) {
		this.status_profile = status_profile;
	}
	get _status_profile() {
		return this.status_profile!;
	}

	set _deleted_profile(deleted_profile: boolean) {
		this.deleted_profile = deleted_profile;
	}
	get _deleted_profile() {
		return this.deleted_profile!;
	}

	/** Methods */
	create() {
		return new Promise<Profile>(async (resolve, reject) => {
			await dml_profile_create(this)
				.then((profiles: Profile[]) => {
					/**
					 * Mutate response
					 */
					const _validations = this.mutateResponse(profiles);

					resolve(_validations[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read(id_company: string) {
		return new Promise<Profile[]>(async (resolve, reject) => {
			await view_profile(this, id_company)
				.then((profiles: Profile[]) => {
					/**
					 * Mutate response
					 */
					const _validations = this.mutateResponse(profiles);

					resolve(_validations);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead(id_company: string) {
		return new Promise<Profile>(async (resolve, reject) => {
			await view_profile_specific_read(this, id_company)
				.then((profiles: Profile[]) => {
					/**
					 * Mutate response
					 */
					const _validations = this.mutateResponse(profiles);

					resolve(_validations[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Profile>(async (resolve, reject) => {
			await dml_profile_update(this)
				.then((profiles: Profile[]) => {
					/**
					 * Mutate response
					 */
					const _validations = this.mutateResponse(profiles);

					resolve(_validations[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_profile_delete(this)
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
	 * @param profiles
	 * @returns
	 */
	private mutateResponse(profiles: Profile[]): Profile[] {
		let _profiles: Profile[] = [];
		profiles.map((item: any) => {
			let _profile: Profile | any = {
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
			delete _profile.id_company;

			_profiles.push(_profile);
		});

		return _profiles;
	}
}
