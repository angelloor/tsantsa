export interface Mensaje {
	id: boolean;
	codigo: string;
	estado: number;
	componente: string;
	descripcion: string;
}

export interface Mensajes {
	[key: number]: Mensaje;
}
