import { verifyToken } from '../../utils/jwt';
import { _mensajes } from '../../utils/mensaje/mensaje';
import { Report } from './report.class';

export const validation = (report: Report, url: string, token: string) => {
	return new Promise<any>(async (resolve, reject) => {
		/**
		 * Capa de Autentificación con el token
		 */
		if (token) {
			await verifyToken(token)
				.then(async () => {
					/**
					 * Instance the class
					 */
					const _report = new Report();
					/**
					 * Execute the url depending on the path
					 */
					if (url.substring(0, 7) == '/delete') {
						/** set required attributes for action */
						_report.id_user_ = report.id_user_;
						_report.name_report = report.name_report;
						await _report
							.delete()
							.then((response: boolean) => {
								resolve(response);
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
