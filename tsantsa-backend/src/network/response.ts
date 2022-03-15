import { _mensajes } from '../utils/mensaje/mensaje';
import { Mensaje } from '../utils/mensaje/mensaje.type';

export const success = (res: any, body: any) => {
	res.status(_mensajes[1].estado || 200).send({
		..._mensajes[1],
		body,
	});
};

export const error = async (res: any, mensaje: Mensaje) => {
	if (mensaje.estado) {
		res.status(mensaje.estado || 500).send(mensaje);
	} else {
		res.status(500).send({
			..._mensajes[2],
			descripcion: _mensajes[2].descripcion.replace('ExCePcIoN', `${mensaje}`),
		});
	}
};
