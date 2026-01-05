import { useEffect, useState, useRef } from "react";

/**
 * Returns true iff `value` has been true for at least `delay` ms.
 */
export const useDelayedTruth = (value: boolean, delay: number): boolean => {
	const [isDelayedTrue, setIsDelayedTrue] = useState(value);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (value) {
			// Start the delay timer
			timeoutRef.current = setTimeout(() => {
				setIsDelayedTrue(true);
				timeoutRef.current = null;
			}, delay);
		} else {
			// Reset immediately if value is false
			setIsDelayedTrue(false);
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		}

		// Cleanup on unmount or value/delay change
		return () => {
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [value, delay]);

	return isDelayedTrue;
};
