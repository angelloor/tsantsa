import jwt from 'jsonwebtoken';
import { _mensajes } from '../utils/mensaje/mensaje';

export const generateToken = (dataAuth: object, expiresIn: number = 180) => {
	return new Promise<string>((resolve, reject) => {
		try {
			const token = jwt.sign(dataAuth, `${process.env.KEY_JWT}`, {
				expiresIn: expiresIn,
			});
			resolve(token);
		} catch (error: any) {
			reject(error.toString());
		}
	});
};

export const verifyToken = (token: string) => {
	return new Promise((resolve, reject) => {
		try {
			jwt.verify(token, `${process.env.KEY_JWT}`, async (err, decoded) => {
				if (decoded != undefined && typeof decoded == 'object') {
					resolve(decoded);
				} else {
					reject(_mensajes[4]);
				}
			});
		} catch (error: any) {
			reject(error.toString());
		}
	});
};
