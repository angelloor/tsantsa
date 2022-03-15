export class Academic {
	/** Attributes */
	public id_user_?: number;
	public id_academic: number;
	public title_academic?: string;
	public abbreviation_academic?: string;
	public nivel_academic?: string;
	public deleted_academic?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_academic: number = 0,
		title_academic: string = '',
		abbreviation_academic: string = '',
		nivel_academic: string = '',
		deleted_academic: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_academic = id_academic;
		this.title_academic = title_academic;
		this.abbreviation_academic = abbreviation_academic;
		this.nivel_academic = nivel_academic;
		this.deleted_academic = deleted_academic;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_academic(id_academic: number) {
		this.id_academic = id_academic;
	}
	get _id_academic() {
		return this.id_academic;
	}

	set _title_academic(title_academic: string) {
		this.title_academic = title_academic;
	}
	get _title_academic() {
		return this.title_academic!;
	}

	set _abbreviation_academic(abbreviation_academic: string) {
		this.abbreviation_academic = abbreviation_academic;
	}
	get _abbreviation_academic() {
		return this.abbreviation_academic!;
	}

	set _nivel_academic(nivel_academic: string) {
		this.nivel_academic = nivel_academic;
	}
	get _nivel_academic() {
		return this.nivel_academic!;
	}

	set _deleted_academic(deleted_academic: boolean) {
		this.deleted_academic = deleted_academic;
	}
	get _deleted_academic() {
		return this.deleted_academic!;
	}
}
