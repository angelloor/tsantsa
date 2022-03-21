import { verifyToken } from '../../../utils/jwt';
import { _mensajes } from '../../../utils/mensaje/mensaje';
import { Home } from './home.class';

export const validation = (url: string, token: string) => {
	return new Promise<Home | any>(async (resolve, reject) => {
		/**
		 * Capa de Autentificación con el token
		 */
		if (token) {
			await verifyToken(token)
				.then(async (decoded: any) => {
					/**
					 * Instance the class
					 */
					const _home = new Home();
					/**
					 * Execute the url depending on the path
					 */
					if (url.substring(0, 8) == '/readBox') {
						/** set required attributes for action */
						await _home
							.read()
							.then((_home: Home) => {
								resolve(_home);
							})
							.catch((error: any) => {
								reject(error);
							});
					} else if (url.substring(0, 12) == '/readDetails') {
						/** set required attributes for action */
						await _home
							.readDetails()
							.then((_home: Home) => {
								resolve(_home);
							})
							.catch((error: any) => {
								reject(error);
							});
					}
				})
				.catch((error) => {
					reject(error);
				});
		} else {
			reject(_mensajes[5]);
		}
	});
};
