import nodemailer from 'nodemailer';
import { Attachments } from './mail.types';
/**
 * Envió del correo
 */
export const sendMail = (mensaje: object) => {
	return new Promise((resolve, reject) => {
		try {
			/**
			 * Crear transporter con la configuración del app.config -> Nota: Si la integracion es
			 * con gmail se debe poner la clave de aplicaciones en el password y el secure es igual a true
			 * Ejemplo:
			 * host: 'smtp.gmail.com'
			 * port: 465
			 * secure: true
			 * user: 'tsantsa.edu@gmail.com'
			 * password: 'kyiufepifvocassms'
			 */
			const transporter = nodemailer.createTransport({
				host: process.env.MAILER_HOST,
				port: parseInt(`${process.env.MAILER_PORT}`),
				secure: false,
				auth: {
					user: process.env.MAILER_USER,
					pass: process.env.MAILER_PASSWORD,
				},
			});
			/**
			 * Envió
			 */
			transporter
				.sendMail(mensaje)
				.then((res) => {
					resolve(`Mensaje: Correo electrónico enviado a ${res.accepted}`);
				})
				.catch((error) => {
					reject(error);
				});
		} catch (error) {
			reject(error);
		}
	});
};

export const generateMail = (
	correo: string,
	subject: string,
	html: string,
	attachments: Attachments[] = []
) => {
	return {
		from: `"U.E.TSANTSA" <${process.env.MAILER_USER}>`,
		to: correo,
		subject: subject,
		html: html,
		attachments: attachments,
	};
};
