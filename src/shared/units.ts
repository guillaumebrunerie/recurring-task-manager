import { Task } from "./tasks";

export const units = ["minutes", "hours", "days", "weeks", "months"] as const;
export type TimeUnit = (typeof units)[number];

const timePeriods: Record<Exclude<TimeUnit, "months">, number> = {
	minutes: 60 * 1000,
	hours: 60 * 60 * 1000,
	days: 24 * 60 * 60 * 1000,
	weeks: 7 * 24 * 60 * 60 * 1000,
};

const timeOffsets: Record<TimeUnit, number> = {
	minutes: 0,
	hours: 0,
	days: 2 * timePeriods.hours, // Cutoff at 2 AM UTC (3 AM in winter, 4 AM in summer)
	weeks: 4 * timePeriods.days + 2 * timePeriods.hours, // Cutoff on Monday at 2 AM UTC
	months: 2 * timePeriods.hours, // Cutoff at 2 AM UTC (3 AM in winter, 4 AM in summer)
};

export const convertToUnit = (timeMs: number, unit: TimeUnit) => {
	if (unit == "months") {
		const date = new Date(timeMs - timeOffsets[unit]);
		return date.getUTCFullYear() * 12 + date.getUTCMonth();
	} else {
		return Math.floor((timeMs - timeOffsets[unit]) / timePeriods[unit]);
	}
};

// Converts a time in a unit to the Unix time at the *beginning* of the period
const convertFromUnit = (timeUnit: number, unit: TimeUnit) => {
	if (unit == "months") {
		const year = Math.floor(timeUnit / 12);
		const month = timeUnit % 12;
		return Date.UTC(year, month, 1, 0, 0, 0, 0) + timeOffsets[unit];
	} else {
		return timeUnit * timePeriods[unit] + timeOffsets[unit];
	}
};

export const convertDurationFromUnit = (
	durationUnit: number,
	unit: TimeUnit,
) => {
	if (unit == "months") {
		return durationUnit * 30 * timePeriods.days; // Approximation
	} else {
		return durationUnit * timePeriods[unit];
	}
};

export const unitToString: Record<TimeUnit, string> = {
	minutes: "minute",
	hours: "heure",
	days: "jour",
	weeks: "semaine",
	months: "mois",
};

export const unitToStringPlural: Record<TimeUnit, string> = {
	minutes: "minutes",
	hours: "heures",
	days: "jours",
	weeks: "semaines",
	months: "mois",
};

const assertUnreachable: (x: never) => never = () => {
	throw new Error("Didn't expect to get here");
};

export const relativeDurationToString = (
	durationUnit: number,
	unit: TimeUnit,
) => {
	switch (unit) {
		case "months":
			if (durationUnit <= -2) {
				return `il y a ${-durationUnit} mois`;
			} else if (durationUnit === -1) {
				return "le mois dernier";
			} else if (durationUnit === 0) {
				return "ce mois-ci";
			} else if (durationUnit === 1) {
				return "le mois prochain";
			} else {
				return `dans ${durationUnit} mois`;
			}
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
			if (durationUnit <= -2) {
				return `il y a ${-durationUnit} heures`;
			} else if (durationUnit === -1) {
				return `il y a une heure`;
			} else if (durationUnit === 0) {
				return "cette heure";
			} else if (durationUnit === 1) {
				return `dans une heure`;
			} else {
				return `dans ${durationUnit} heures`;
			}
		case "minutes":
			if (durationUnit <= -2) {
				return `il y a ${-durationUnit} minutes`;
			} else if (durationUnit === -1) {
				return `il y a une minute`;
			} else if (durationUnit === 0) {
				return "maintenant";
			} else if (durationUnit === 1) {
				return `dans une minute`;
			} else {
				return `dans ${durationUnit} minutes`;
			}
		default:
			assertUnreachable(unit);
	}
};

const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
	dateStyle: "full",
	timeStyle: "short",
});

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
	dateStyle: "full",
});

export const timeToString = (time: number, unit: TimeUnit) => {
	const timeUnit = convertToUnit(time, unit);
	const date = new Date(convertFromUnit(timeUnit, unit));
	switch (unit) {
		case "months":
			const year = Math.floor(timeUnit / 12);
			const month = timeUnit % 12;
			const monthNames = [
				"janvier",
				"février",
				"mars",
				"avril",
				"mai",
				"juin",
				"juillet",
				"août",
				"septembre",
				"octobre",
				"novembre",
				"décembre",
			];
			return `en ${monthNames[month]} ${year}`;
		case "weeks":
			return `la semaine du ${dateFormat.format(date)}`;
		case "days":
			return `le ${dateFormat.format(date)}`;
		case "hours":
			return `le ${dateTimeFormat.format(date)}`;
		case "minutes":
			return `le ${dateTimeFormat.format(date)}`;
		default:
			assertUnreachable(unit);
	}
};

export const durationUnitToString = (durationUnit: number, unit: TimeUnit) => {
	return `${durationUnit} ${unitToString[unit]}${durationUnit !== 1 && unit !== "months" ? "s" : ""}`;
};

/** Returns the earliest time at which the task should be completed again. If
    this is after the current time, the task is not due yet. */
export const getMinTimeLeft = (task: Task, toBeDoneTime: number) => {
	const toBeDoneTimeInUnit = convertToUnit(toBeDoneTime, task.toleranceUnit);
	return convertFromUnit(
		toBeDoneTimeInUnit - task.tolerance,
		task.toleranceUnit,
	);
};

/** Returns the latest time at which the task should be completed again. If this
    is before the current time, the task is overdue. */
export const getMaxTimeLeft = (task: Task, toBeDoneTime: number) => {
	const toBeDoneTimeInUnit = convertToUnit(toBeDoneTime, task.toleranceUnit);
	return convertFromUnit(
		toBeDoneTimeInUnit + task.tolerance + 1,
		task.toleranceUnit,
	);
};
