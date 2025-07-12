export const toLocalDateTimeString = (time: number) => {
	const pad = (n: number) => String(n).padStart(2, "0");

	const date = new Date(time);
	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1); // getMonth is 0-based
	const day = pad(date.getDate());
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());

	return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const fromLocalDateTimeString = (dateTime: string) => {
	return new Date(dateTime).getTime();
};
