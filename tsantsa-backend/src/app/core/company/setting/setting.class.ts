export class Setting {
	/** Attributes */
	public id_user_?: number;
	public id_setting: number;
	public expiration_token?: number;
	public expiration_verification_code?: number;
	public inactivity_time?: number;
	public session_limit?: number;
	public deleted_setting?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_setting: number = 0,
		expiration_token: number = 0,
		expiration_verification_code: number = 0,
		inactivity_time: number = 0,
		session_limit: number = 0,
		deleted_setting: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_setting = id_setting;
		this.expiration_token = expiration_token;
		this.expiration_verification_code = expiration_verification_code;
		this.inactivity_time = inactivity_time;
		this.session_limit = session_limit;
		this.deleted_setting = deleted_setting;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_setting(id_setting: number) {
		this.id_setting = id_setting;
	}
	get _id_setting() {
		return this.id_setting;
	}

	set _expiration_token(expiration_token: number) {
		this.expiration_token = expiration_token;
	}
	get _expiration_token() {
		return this.expiration_token!;
	}

	set _expiration_verification_code(expiration_verification_code: number) {
		this.expiration_verification_code = expiration_verification_code;
	}
	get _expiration_verification_code() {
		return this.expiration_verification_code!;
	}

	set _inactivity_time(inactivity_time: number) {
		this.inactivity_time = inactivity_time;
	}
	get _inactivity_time() {
		return this.inactivity_time!;
	}

	set _session_limit(session_limit: number) {
		this.session_limit = session_limit;
	}
	get _session_limit() {
		return this.session_limit!;
	}

	set _deleted_setting(deleted_setting: boolean) {
		this.deleted_setting = deleted_setting;
	}
	get _deleted_setting() {
		return this.deleted_setting!;
	}
}
