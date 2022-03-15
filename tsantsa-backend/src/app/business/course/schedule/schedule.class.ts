export class Schedule {
	/** Attributes */
	public id_user_?: number;
	public id_schedule: number;
	public start_date_schedule?: string;
	public end_date_schedule?: string;
	public tolerance_schedule?: number;
	public creation_date_schedule?: string;
	public deleted_schedule?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_schedule: number = 0,
		start_date_schedule: string = '',
		end_date_schedule: string = '',
		tolerance_schedule: number = 0,
		creation_date_schedule: string = '',
		deleted_schedule: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_schedule = id_schedule;
		this.start_date_schedule = start_date_schedule;
		this.end_date_schedule = end_date_schedule;
		this.tolerance_schedule = tolerance_schedule;
		this.creation_date_schedule = creation_date_schedule;
		this.deleted_schedule = deleted_schedule;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_schedule(id_schedule: number) {
		this.id_schedule = id_schedule;
	}
	get _id_schedule() {
		return this.id_schedule;
	}

	set _start_date_schedule(start_date_schedule: string) {
		this.start_date_schedule = start_date_schedule;
	}
	get _start_date_schedule() {
		return this.start_date_schedule!;
	}

	set _end_date_schedule(end_date_schedule: string) {
		this.end_date_schedule = end_date_schedule;
	}
	get _end_date_schedule() {
		return this.end_date_schedule!;
	}

	set _tolerance_schedule(tolerance_schedule: number) {
		this.tolerance_schedule = tolerance_schedule;
	}
	get _tolerance_schedule() {
		return this.tolerance_schedule!;
	}

	set _creation_date_schedule(creation_date_schedule: string) {
		this.creation_date_schedule = creation_date_schedule;
	}
	get _creation_date_schedule() {
		return this.creation_date_schedule!;
	}

	set _deleted_schedule(deleted_schedule: boolean) {
		this.deleted_schedule = deleted_schedule;
	}
	get _deleted_schedule() {
		return this.deleted_schedule!;
	}
}
