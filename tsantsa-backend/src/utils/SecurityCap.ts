import CryptoJS from 'crypto-js';

export class SecurityCap {
	constructor() {}
	/**
	 * Encripta un string con AES (encriptación simétrica)
	 * @param text
	 * @returns texto encriptado con AES-256
	 */
	aesEncrypt(text: string) {
		const passEncryptEncrypted = this.algorithm_encrypt(
			`${process.env.PASS_ENCRYPT}`.toString()
		);
		const textEncrypted = this.algorithm_encrypt(text);

		const hex = this.hexEncode(passEncryptEncrypted);

		const key = CryptoJS.enc.Hex.parse(hex);
		var iv = CryptoJS.enc.Hex.parse(hex);

		let encrypted = CryptoJS.AES.encrypt(textEncrypted, key, { iv });
		return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
	}
	/**
	 * Desencripta un string con AES (encriptación simétrica)
	 * @param _encryptText
	 * @returns Texto desencriptado
	 */
	aesDecrypt(_encryptText: string) {
		const passEncryptEncrypted = this.algorithm_encrypt(
			`${process.env.PASS_ENCRYPT}`.toString()
		);

		const hex = this.hexEncode(passEncryptEncrypted);

		const key = CryptoJS.enc.Hex.parse(hex);
		var iv = CryptoJS.enc.Hex.parse(hex);

		const bytes = CryptoJS.AES.decrypt(_encryptText, key, { iv });
		return this.algorithm_decrypt(bytes.toString(CryptoJS.enc.Utf8));
	}
	/**
	 * Aplica el cifrado de caracteres
	 * @param text
	 * @returns texto cifrado
	 */
	algorithm_encrypt(text: string): string {
		const _stringInvert = this.stringInvert(text);
		return this.stringPositionInvert(_stringInvert);
	}
	/**
	 * Aplica el descifrado de caracteres
	 * @param _stringPositionInvert
	 * @returns texto descifrado
	 */
	algorithm_decrypt(_stringPositionInvert: string): string {
		let _stringInvert = this.stringPositionInvert(_stringPositionInvert);
		return this.stringInvert(_stringInvert);
	}
	/**
	 * Algoritmo para invertir caracteres de un string
	 * @param string
	 * @returns
	 */
	stringInvert = (string: string): string => {
		let inverted = '';
		for (var i = string.length - 1; i >= 0; i--) {
			inverted += string.charAt(i);
		}
		return inverted;
	};
	/**
	 * Algoritmo para invertir las posiciones de un string
	 * @param string
	 * @returns
	 */
	stringPositionInvert = (string: string): string => {
		let positionInvert = '';
		let first = '';
		let second = '';

		let intermediatePosition = Math.trunc(string.length / 2);

		first = string.substring(0, intermediatePosition);

		if (string.length % 2 == 0) {
			second = string.substring(intermediatePosition, string.length);
			positionInvert = `${second}${first}`;
		} else {
			second = string.substring(intermediatePosition + 1, string.length);
			positionInvert = `${second}${string.charAt(
				intermediatePosition
			)}${first}`;
		}
		return positionInvert;
	};
	/**
	 * Codifica un string a hexadecimal
	 * @param _string
	 * @returns
	 */
	hexEncode = (_string: string): string => {
		var hex, i;
		var result = '';
		for (i = 0; i < _string.length; i++) {
			hex = _string.charCodeAt(i).toString(16);
			result += ('0' + hex).slice(-2);
		}
		return result;
	};
	/**
	 * Decodifica un hexadecimal a string
	 * @param _string
	 * @returns
	 */
	hexDecode = (_string: string): string => {
		var j;
		var hexes = _string.match(/.{1,2}/g) || [];
		var back = '';
		for (j = 0; j < hexes.length; j++) {
			back += String.fromCharCode(parseInt(hexes[j], 16));
		}
		return back;
	};
}
