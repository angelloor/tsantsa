import { User } from '../user/user.class';
import { _user } from '../user/user.data';
import {
	dml_session_by_company_release_all,
	dml_session_by_session_release,
	dml_session_by_user_release_all,
	view_session,
	view_session_by_user_read,
	view_session_specific_read,
} from './session.store';

export class Session {
	/** Attributes */
	public id_user_?: number;
	public id_session: number;
	public user: User;
	public host_session?: string;
	public agent_session?: string;
	public date_sign_in_session?: string;
	public date_sign_out_session?: string;
	public status_session?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_session: number = 0,
		user: User = _user,
		host_session: string = '',
		agent_session: string = '',
		date_sign_in_session: string = '',
		date_sign_out_session: string = '',
		status_session: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_session = id_session;
		this.user = user;
		this.host_session = host_session;
		this.agent_session = agent_session;
		this.date_sign_in_session = date_sign_in_session;
		this.date_sign_out_session = date_sign_out_session;
		this.status_session = status_session;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_session(id_session: number) {
		this.id_session = id_session;
	}
	get _id_session() {
		return this.id_session;
	}

	set _user(user: User) {
		this.user = user;
	}
	get _user() {
		return this.user;
	}

	set _host_session(host_session: string) {
		this.host_session = host_session;
	}
	get _host_session() {
		return this.host_session!;
	}

	set _agent_session(agent_session: string) {
		this.agent_session = agent_session;
	}
	get _agent_session() {
		return this.agent_session!;
	}

	set _date_sign_in_session(date_sign_in_session: string) {
		this.date_sign_in_session = date_sign_in_session;
	}
	get _date_sign_in_session() {
		return this.date_sign_in_session!;
	}

	set _date_sign_out_session(date_sign_out_session: string) {
		this.date_sign_out_session = date_sign_out_session;
	}
	get _date_sign_out_session() {
		return this.date_sign_out_session!;
	}

	set _status_session(status_session: boolean) {
		this.status_session = status_session;
	}
	get _status_session() {
		return this.status_session!;
	}

	/** Methods */
	read(id_company: string) {
		return new Promise<Session[]>(async (resolve, reject) => {
			await view_session(this, id_company)
				.then((sessions: Session[]) => {
					/**
					 * Mutate response
					 */
					const _sessions = this.mutateResponse(sessions);

					resolve(_sessions);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead(id_company: string) {
		return new Promise<Session>(async (resolve, reject) => {
			await view_session_specific_read(this, id_company)
				.then((sessions: Session[]) => {
					/**
					 * Mutate response
					 */
					const _sessions = this.mutateResponse(sessions);

					resolve(_sessions[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byUserRead(id_company: string) {
		return new Promise<Session[]>(async (resolve, reject) => {
			await view_session_by_user_read(this, id_company)
				.then((sessions: Session[]) => {
					/**
					 * Mutate response
					 */
					const _sessions = this.mutateResponse(sessions);

					resolve(_sessions);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	bySessionRelease() {
		return new Promise<Session>(async (resolve, reject) => {
			await dml_session_by_session_release(this)
				.then((sessions: Session[]) => {
					/**
					 * Mutate response
					 */
					const _sessions = this.mutateResponse(sessions);

					resolve(_sessions[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byUserReleaseAll() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_session_by_user_release_all(this)
				.then((response: boolean) => {
					resolve(response);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	byCompanyReleaseAll() {
		return new Promise<boolean>(async (resolve, reject) => {
			await dml_session_by_company_release_all(this)
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
	 * @param sessions
	 * @returns
	 */
	private mutateResponse(sessions: Session[]): Session[] {
		let _sessions: Session[] = [];

		sessions.map((item: any) => {
			let _session: Session | any = {
				...item,
				id_session: item.id_session_,
				user: {
					id_user: item.id_user,
					type_user: item.type_user,
					name_user: item.name_user,
					avatar_user: item.avatar_user,
					status_user: item.status_user,
					company: {
						id_company: item.id_company,
						name_company: item.name_company,
						status_company: item.status_company,
						setting: {
							id_setting: item.id_setting,
						},
					},
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
						type_profile: item.type_profile,
						name_profile: item.name_profile,
						description_profile: item.description_profile,
						status_profile: item.status_profile,
					},
				},
				/**
				 * Generate structure of second level the entity (is important add the ids of entity)
				 * similar the return of read
				 */
			};
			/**
			 * delete ids of principal object level
			 */
			delete _session.id_session_;

			delete _session.id_user;
			delete _session.type_user;
			delete _session.name_user;
			delete _session.password_user;
			delete _session.avatar_user;
			delete _session.status_user;

			delete _session.id_company;
			delete _session.name_company;
			delete _session.status_company;
			delete _session.id_setting;

			delete _session.id_person;
			delete _session.id_academic;
			delete _session.id_job;
			delete _session.dni_person;
			delete _session.name_person;
			delete _session.last_name_person;
			delete _session.address_person;
			delete _session.phone_person;

			delete _session.id_profile;
			delete _session.type_profile;
			delete _session.name_profile;
			delete _session.description_profile;
			delete _session.status_profile;

			_sessions.push(_session);
		});

		return _sessions;
	}
}
