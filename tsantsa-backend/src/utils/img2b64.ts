import imageToBase64 from 'image-to-base64';
/**
 * Trasformar una imagen a B64
 */
export const generateImage2B64 = async (url: string) => {
	const r = await imageToBase64(url);
	return r;
};
