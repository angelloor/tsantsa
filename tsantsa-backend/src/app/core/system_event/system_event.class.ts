import { User } from '../user/user.class';
import { _user } from '../user/user.data';
import {
	view_system_event,
	view_system_event_specific_read,
} from './system_event.store';

export class SystemEvent {
	/** Attributes */
	public id_user_?: number;
	public id_system_event: number;
	public user: User;
	public table_system_event?: string;
	public row_system_event?: number;
	public action_system_event?: string;
	public date_system_event?: string;
	public deleted_system_event?: boolean;
	/** Constructor */
	constructor(
		id_user_: number = 0,
		id_system_event: number = 0,
		user: User = _user,
		table_system_event: string = '',
		row_system_event: number = 0,
		action_system_event: string = '',
		date_system_event: string = '',
		deleted_system_event: boolean = false
	) {
		this.id_user_ = id_user_;
		this.id_system_event = id_system_event;
		this.user = user;
		this.table_system_event = table_system_event;
		this.row_system_event = row_system_event;
		this.action_system_event = action_system_event;
		this.date_system_event = date_system_event;
		this.deleted_system_event = deleted_system_event;
	}
	/** Setters and Getters */
	set _id_user_(id_user_: number) {
		this.id_user_ = id_user_;
	}
	get _id_user_() {
		return this.id_user_!;
	}

	set _id_system_event(id_system_event: number) {
		this.id_system_event = id_system_event;
	}
	get _id_system_event() {
		return this.id_system_event;
	}

	set _user(user: User) {
		this.user = user;
	}
	get _user() {
		return this.user;
	}

	set _table_system_event(table_system_event: string) {
		this.table_system_event = table_system_event;
	}
	get _table_system_event() {
		return this.table_system_event!;
	}

	set _row_system_event(row_system_event: number) {
		this.row_system_event = row_system_event;
	}
	get _row_system_event() {
		return this.row_system_event!;
	}

	set _action_system_event(action_system_event: string) {
		this.action_system_event = action_system_event;
	}
	get _action_system_event() {
		return this.action_system_event!;
	}

	set _date_system_event(date_system_event: string) {
		this.date_system_event = date_system_event;
	}
	get _date_system_event() {
		return this.date_system_event!;
	}

	set _deleted_system_event(deleted_system_event: boolean) {
		this.deleted_system_event = deleted_system_event;
	}
	get _deleted_system_event() {
		return this.deleted_system_event!;
	}

	/** Methods */
	read() {
		return new Promise<SystemEvent[]>(async (resolve, reject) => {
			await view_system_event(this)
				.then((systemEvents: SystemEvent[]) => {
					/**
					 * Mutate response
					 */
					const _systemEvents = this.mutateResponse(systemEvents);

					resolve(_systemEvents);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	specificRead() {
		return new Promise<SystemEvent>(async (resolve, reject) => {
			await view_system_event_specific_read(this)
				.then((systemEvents: SystemEvent[]) => {
					/**
					 * Mutate response
					 */
					const _systemEvents = this.mutateResponse(systemEvents);

					resolve(_systemEvents[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}
	/**
	 * Eliminar ids de entidades externas y formatear la informacion en el esquema correspondiente
	 * @param systemEvents
	 * @returns
	 */
	private mutateResponse(systemEvents: SystemEvent[]): SystemEvent[] {
		let _systemEvents: SystemEvent[] = [];

		systemEvents.map((item: any) => {
			let _systemEvent: SystemEvent | any = {
				...item,
				user: {
					id_user: item.id_user,
					company: {
						id_company: item.id_company,
						setting: {
							id_setting: item.id_setting,
						},
						name_company: item.name_company,
						status_company: item.status_company,
					},
					person: {
						id_person: item.id_person,
						dni_person: item.dni_person,
						name_person: item.name_person,
						last_name_person: item.last_name_person,
						address_person: item.address_person,
						phone_person: item.phone_person,
					},
					id_profile: item.id_profile,
					id_academic: item.id_academic,
					id_job: item.id_job,
					type_user: item.type_user,
					name_user: item.name_user,
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
			delete _systemEvent.id_user;
			delete _systemEvent.id_company;
			delete _systemEvent.id_person;
			delete _systemEvent.dni_person;
			delete _systemEvent.name_person;
			delete _systemEvent.last_name_person;
			delete _systemEvent.address_person;
			delete _systemEvent.phone_person;
			delete _systemEvent.id_profile;
			delete _systemEvent.id_academic;
			delete _systemEvent.id_job;
			delete _systemEvent.type_user;
			delete _systemEvent.name_user;
			delete _systemEvent.password_user;
			delete _systemEvent.avatar_user;
			delete _systemEvent.status_user;

			delete _systemEvent.id_setting;
			delete _systemEvent.name_company;
			delete _systemEvent.status_company;

			_systemEvents.push(_systemEvent);
		});

		return _systemEvents;
	}
}
