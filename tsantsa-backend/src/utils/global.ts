import imageToBase64 from 'image-to-base64';
/**
 * generateRandomNumber
 * @param length
 * @returns randomNumber
 */
export const generateRandomNumber = (length: number): number => {
	let number = '';
	for (let x = 1; x <= length; x++) {
		let random = Math.floor(Math.random() * 10);
		if (random == 10) {
			random = random - 1;
		}
		number = number + random.toString();
	}
	return parseInt(number);
};
/**
 * Transform image to B64
 * @param url
 * @returns B64
 */
export const generateImage2B64 = async (url: string) => {
	const r = await imageToBase64(url);
	return r;
};
