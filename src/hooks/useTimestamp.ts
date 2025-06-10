import { useState, useEffect } from "react";

export const useTimestamp = (delay: number | null = null) => {
	const [timestamp, setTimestamp] = useState(() => Date.now());

	useEffect(() => {
		if (delay !== null) {
			const interval = setInterval(() => {
				setTimestamp(Date.now());
			}, delay);

			return () => clearInterval(interval);
		}
	}, [delay]);

	return timestamp;
};
