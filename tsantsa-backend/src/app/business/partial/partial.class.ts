import { Quimester } from '../quimester/quimester.class';
import { _quimester } from '../quimester/quimester.data';
import {
	dml_partial_create,
	dml_partial_delete,
	dml_partial_update,
	view_partial,
	view_partial_by_quimester_read,
	view_partial_specific_read,
} from './partial.store';

export class Partial {
	/** Attributes */
	public id_user_?: number;
	public id_partial: number;
	public quimester: Quimester;
	public name_partial?: string;
	public description_partial?: string;
	public deleted_partial?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_partial: number = 0,
		quimester: Quimester = _quimester,
		name_partial: string = '',
		description_partial: string = '',
		deleted_partial: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_partial = id_partial;
		this.quimester = quimester;
		this.name_partial = name_partial;
		this.description_partial = description_partial;
		this.deleted_partial = deleted_partial;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_partial(id_partial: number) {
		this.id_partial = id_partial;
	}
	get _id_partial() {
		return this.id_partial;
	}

	set _quimester(quimester: Quimester) {
		this.quimester = quimester;
	}
	get _quimester() {
		return this.quimester;
	}

	set _name_partial(name_partial: string) {
		this.name_partial = name_partial;
	}
	get _name_partial() {
		return this.name_partial!;
	}

	set _description_partial(description_partial: string) {
		this.description_partial = description_partial;
	}
	get _description_partial() {
		return this.description_partial!;
	}

	set _deleted_partial(deleted_partial: boolean) {
		this.deleted_partial = deleted_partial;
	}
	get _deleted_partial() {
		return this.deleted_partial!;
	}

	/** Methods */
	create() {
		return new Promise<Partial>(async (resolve, reject) => {
			await dml_partial_create(this)
				.then((partials: Partial[]) => {
					/**
					 * Mutate response
					 */
					const _partials = this.mutateResponse(partials);

					resolve(_partials[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	read() {
		return new Promise<Partial[]>(async (resolve, reject) => {
			await view_partial(this)
				.then((partials: Partial[]) => {
					/**
					 * Mutate response
					 */
					const _partials = this.mutateResponse(partials);

					resolve(_partials);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<Partial>(async (resolve, reject) => {
			await view_partial_specific_read(this)
				.then((partials: Partial[]) => {
					/**
					 * Mutate response
					 */
					const _partials = this.mutateResponse(partials);

					resolve(_partials[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byQuimesterRead() {
		return new Promise<Partial[]>(async (resolve, reject) => {
			await view_partial_by_quimester_read(this)
				.then((partials: Partial[]) => {
					/**
					 * Mutate response
					 */
					const _partials = this.mutateResponse(partials);

					resolve(_partials);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	update() {
		return new Promise<Partial>(async (resolve, reject) => {
			await dml_partial_update(this)
				.then((partials: Partial[]) => {
					/**
					 * Mutate response
					 */
					const _partials = this.mutateResponse(partials);

					resolve(_partials[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	delete() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_partial_delete(this)
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
	 * @param partials
	 * @returns
	 */
	private mutateResponse(partials: Partial[]): Partial[] {
		let _partials: Partial[] = [];

		partials.map((item: any) => {
			let _partial: Partial | any = {
				...item,
				quimester: {
					id_quimester: item.id_quimester,
					period: {
						id_period: item.id_period,
					},
					name_quimester: item.name_quimester,
					description_quimester: item.description_quimester,
				},
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _partial.id_quimester;
			delete _partial.id_period;
			delete _partial.name_quimester;
			delete _partial.description_quimester;

			_partials.push(_partial);
		});

		return _partials;
	}
}
