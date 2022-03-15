export const defaultMail = () => {
	const html: string = `<h1>Hola mundo!</h1>`;
	return html;
};

export const forgotPasswordMail = (code: number, expiration: number) => {
	const html: string = `
	<div>
		<strong>Estimado(a).</strong>
		<br>
		<br>
		<p>Usted ha solicitado restablecer su contraseña, para poder continuar con la acción tiene que ingresar el siguiente código.</p>
		<strong>Codigo de confirmación: ${code}</strong><br>
		<strong>Tiempo de expiración: ${expiration} ${
		expiration > 1 ? `segundos` : `segundo`
	}</strong><br><br>
	 	<strong>SALUDOS CORDIALES.</strong>
	 	<br>
	</div>`;
	return html;
};
