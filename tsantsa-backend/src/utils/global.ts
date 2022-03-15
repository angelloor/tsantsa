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
