import { Doc } from "../convex/_generated/dataModel";

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

const convertToUnit = (timeMs: number, unit: TimeUnit) => {
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

const unitToString: Record<TimeUnit, string> = {
	seconds: "seconde",
	minutes: "minute",
	hours: "heure",
	days: "jour",
	weeks: "semaine",
};

export const durationToString = (durationMs: number, unit: TimeUnit) => {
	if (durationMs < 0) {
		console.error(
			"Negative timeMs passed to durationToString:",
			durationMs,
		);
	}
	const durationUnit = Math.ceil(durationMs / timePeriods[unit]);
	return durationUnitToString(durationUnit, unit);
};

export const durationUnitToString = (durationUnit: number, unit: TimeUnit) => {
	return `${durationUnit} ${unitToString[unit]}${durationUnit !== 1 ? "s" : ""}`;
};

/** Returns the earliest time at which the task should be completed again. If
    this is after the current time, the task is not due yet. */
export const getMinTimeLeft = (
	task: Doc<"tasks">,
	lastCompletionTime: number,
) => {
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
export const getTimeLeft = (task: Doc<"tasks">, lastCompletionTime: number) => {
	const lastCompletionTimeInUnit = convertToUnit(
		lastCompletionTime,
		task.unit,
	);
	return convertFromUnit(lastCompletionTimeInUnit + task.period, task.unit);
};

/** Returns the latest time at which the task should be completed again. If this
    is before the current time, the task is overdue. */
export const getMaxTimeLeft = (
	task: Doc<"tasks">,
	lastCompletionTime: number,
) => {
	const lastCompletionTimeInUnit = convertToUnit(
		lastCompletionTime,
		task.unit,
	);
	return convertFromUnit(
		lastCompletionTimeInUnit + task.period + task.tolerance + 1,
		task.unit,
	);
};
