import { Mensajes } from './mensaje.type';
export const _mensajes: Mensajes = {
	1: {
		id: true,
		codigo: '01-001',
		estado: 200,
		componente: 'success',
		descripcion: 'Transaction Ok!',
	},
	2: {
		id: false,
		codigo: '02-002',
		estado: 500,
		componente: 'unknown',
		descripcion: 'Excepción desconocida: ExCePcIoN',
	},
	3: {
		id: false,
		codigo: '03-003',
		estado: 400,
		componente: 'database',
		descripcion: 'Database Message',
	},
	4: {
		id: false,
		codigo: '04-004',
		estado: 400,
		componente: 'auth',
		descripcion: 'No Autorizado!',
	},
	5: {
		id: false,
		codigo: '04-005',
		estado: 400,
		componente: 'auth',
		descripcion: 'No se ha recibido el token',
	},
	6: {
		id: false,
		codigo: '05-006',
		estado: 400,
		componente: 'validations',
		descripcion: 'No se ha recibido el _nombreCampo',
	},
	7: {
		id: false,
		codigo: '05-007',
		estado: 400,
		componente: 'validations',
		descripcion:
			'El tipo de dato de _nombreCampo es incorrecto, se esperaba _tipoEsperado',
	},
	8: {
		id: false,
		codigo: '05-008',
		estado: 400,
		componente: 'validations',
		descripcion:
			'La longitud de _nombreCampo no puede ser mayor a _caracteresEsperados caracteres',
	},
	9: {
		id: false,
		codigo: '05-009',
		estado: 400,
		componente: 'validations',
		descripcion:
			'El formato de la contraseña no cumple con su formato establecido (_formatoEstablecido)',
	},
};
