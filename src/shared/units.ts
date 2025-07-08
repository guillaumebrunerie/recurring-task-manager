import { Task } from "./tasks";

export const units = ["seconds", "minutes", "hours", "days", "weeks"] as const;
export type TimeUnit = (typeof units)[number];

const timePeriods: Record<TimeUnit, number> = {
	seconds: 1000,
	minutes: 60 * 1000,
	hours: 60 * 60 * 1000,
	days: 24 * 60 * 60 * 1000,
	weeks: 7 * 24 * 60 * 60 * 1000,
};

const timeOffsets: Record<TimeUnit, number> = {
	seconds: 0,
	minutes: 0,
	hours: 0,
	days: 2 * timePeriods.hours, // Cutoff at 2 AM UTC (3 AM in winter, 4 AM in summer)
	weeks: 4 * timePeriods.days + 2 * timePeriods.hours, // Cutoff on Monday at 2 AM UTC
};

export const convertToUnit = (timeMs: number, unit: TimeUnit) => {
	return Math.floor((timeMs - timeOffsets[unit]) / timePeriods[unit]);
};

// Converts to the *beginning* of the period
const convertFromUnit = (timeUnit: number, unit: TimeUnit) => {
	return timeUnit * timePeriods[unit] + timeOffsets[unit];
};

export const convertDurationFromUnit = (
	durationUnit: number,
	unit: TimeUnit,
) => {
	return durationUnit * timePeriods[unit];
};

export const unitToString: Record<TimeUnit, string> = {
	seconds: "seconde",
	minutes: "minute",
	hours: "heure",
	days: "jour",
	weeks: "semaine",
};

export const relativeDurationToString = (
	durationUnit: number,
	unit: TimeUnit,
) => {
	switch (unit) {
		// case "months":
		// 	if (durationUnit <= -2) {
		// 		return `il y a ${-durationUnit} mois`;
		// 	} else if (durationUnit === -1) {
		// 		return "le mois dernier";
		// 	} else if (durationUnit === 0) {
		// 		return "cette mois-ci";
		// 	} else if (durationUnit === 1) {
		// 		return "le mois prochain";
		// 	} else {
		// 		return `dans ${durationUnit} mois`;
		// 	}
		case "weeks":
			if (durationUnit <= -2) {
				return `il y a ${-durationUnit} semaines`;
			} else if (durationUnit === -1) {
				return "la semaine dernière";
			} else if (durationUnit === 0) {
				return "cette semaine";
			} else if (durationUnit === 1) {
				return "la semaine prochaine";
			} else {
				return `dans ${durationUnit} semaines`;
			}
		case "days":
			if (durationUnit <= -2) {
				return `il y a ${-durationUnit} jours`;
			} else if (durationUnit === -1) {
				return "hier";
			} else if (durationUnit === 0) {
				return "aujourd'hui";
			} else if (durationUnit === 1) {
				return "demain";
			} else {
				return `dans ${durationUnit} jours`;
			}
		case "hours":
		case "minutes":
		case "seconds":
			if (durationUnit <= -2) {
				return `il y a ${-durationUnit} ${unitToString[unit]}s`;
			} else if (durationUnit === -1) {
				return `il y a une ${unitToString[unit]}`;
			} else if (durationUnit === 0) {
				return "maintenant";
			} else if (durationUnit === 1) {
				return `dans une ${unitToString[unit]}`;
			} else {
				return `dans ${durationUnit} ${unitToString[unit]}s`;
			}
	}
};

export const durationUnitToString = (durationUnit: number, unit: TimeUnit) => {
	return `${durationUnit} ${unitToString[unit]}${durationUnit !== 1 ? "s" : ""}`;
};

/** Returns the earliest time at which the task should be completed again. If
    this is after the current time, the task is not due yet. */
export const getMinTimeLeft = (task: Task, lastCompletionTime: number) => {
	const lastCompletionTimeInUnit = convertToUnit(
		lastCompletionTime,
		task.unit,
	);
	return convertFromUnit(
		lastCompletionTimeInUnit + task.period - task.tolerance,
		task.unit,
	);
};

/** Returns the time at which the task should be completed again */
export const getTimeLeft = (task: Task, lastCompletionTime: number) => {
	const lastCompletionTimeInUnit = convertToUnit(
		lastCompletionTime,
		task.unit,
	);
	return convertFromUnit(lastCompletionTimeInUnit + task.period, task.unit);
};

/** Returns the latest time at which the task should be completed again. If this
    is before the current time, the task is overdue. */
export const getMaxTimeLeft = (task: Task, lastCompletionTime: number) => {
	const lastCompletionTimeInUnit = convertToUnit(
		lastCompletionTime,
		task.unit,
	);
	return convertFromUnit(
		lastCompletionTimeInUnit + task.period + task.tolerance + 1,
		task.unit,
	);
};
