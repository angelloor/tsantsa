import { view_details, view_home } from './home.store';
import { Box, Details } from './home.type';

export class Home {
	/** Attributes */
	public box?: Box[];
	public detail?: Details[];
	/** Constructor */
	constructor() {}

	/** Methods */
	read() {
		return new Promise<Home>(async (resolve, reject) => {
			await view_home()
				.then((home: Home[]) => {
					resolve(home[0]);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	readDetails() {
		return new Promise<Home>(async (resolve, reject) => {
			await view_details()
				.then((_details: Home[]) => {
					let data: any = {
						details: {
							columns: [
								'name_period',
								'students',
								'teachers',
								'courses',
								'tasks',
								'approval_note_period',
							],
							rows: _details,
						},
					};
					resolve(data);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}
}
