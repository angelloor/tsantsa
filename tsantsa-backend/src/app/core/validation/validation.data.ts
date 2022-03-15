import { Validation } from './validation.class';
export const _validation = new Validation();

export const _validations = [
	{
		nameValidation: 'validationPassword',
		validationPattern:
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
		messagePattern:
			'Mínimo 8(c), máximo 20(c), al menos una letra mayúscula, una letra minúscula, un número y un carácter especial',
	},
	{
		nameValidation: 'validationDNI',
		validationPattern: /^[0-9]*$/,
		messagePattern: 'Solo se permiten numeros',
	},
	{
		nameValidation: 'validationPhoneNumber',
		validationPattern: /^[0-9]*$/,
		messagePattern: 'Solo se permiten numeros',
	},
];
