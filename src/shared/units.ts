export const units = [
	"seconds",
	"minutes",
	"hours",
	"days",
	"weeks",
	"months",
	"years",
] as const;
export type TimeUnit = (typeof units)[number];

const secondDuration = 1000;
const minuteDuration = 60 * secondDuration;
const hourDuration = 60 * minuteDuration;
const dayDuration = 24 * hourDuration;
const weekDuration = 7 * dayDuration;
const monthDuration = 30 * dayDuration; // Approximation
const yearDuration = 365 * dayDuration; // Approximation

const dayOffset = 2 * hourDuration; // Cutoff at 2 AM UTC (3 AM in winter, 4 AM in summer)
const weekOffset = 4 * dayDuration + dayOffset; // Monday at 2 AM UTC

// Given a timestamp and a unit, return a number representing that timestamp in
// that unit.
export const convertToUnit = (timeMs: number, unit: TimeUnit): number => {
	const date = new Date(timeMs - dayOffset);
	switch (unit) {
		case "years":
			return date.getUTCFullYear();
		case "months":
			return date.getUTCFullYear() * 12 + date.getUTCMonth();
		case "weeks":
			return Math.floor((timeMs - weekOffset) / weekDuration);
		case "days":
			return Math.floor((timeMs - dayOffset) / dayDuration);
		case "hours":
			return Math.floor(timeMs / hourDuration);
		case "minutes":
			return Math.floor(timeMs / minuteDuration);
		case "seconds":
			return Math.floor(timeMs / secondDuration);
	}
};

// Converts a time in a unit to the timestamp at the *beginning* of the period
const convertFromUnit = (timeUnit: number, unit: TimeUnit): number => {
	switch (unit) {
		case "years":
			return Date.UTC(timeUnit, 0, 1, 0) + dayOffset;
		case "months": {
			const year = Math.floor(timeUnit / 12);
			const month = timeUnit % 12;
			return Date.UTC(year, month, 1, 0) + dayOffset;
		}
		case "weeks":
			return timeUnit * weekDuration + weekOffset;
		case "days":
			return timeUnit * dayDuration + dayOffset;
		case "hours":
			return timeUnit * hourDuration;
		case "minutes":
			return timeUnit * minuteDuration;
		case "seconds":
			return timeUnit * secondDuration;
	}
};

// Converts a duration in a unit to a duration in milliseconds. May be
// approximative for units like months or years.
export const convertDurationFromUnit = (
	durationUnit: number,
	unit: TimeUnit,
): number => {
	switch (unit) {
		case "years":
			return durationUnit * yearDuration;
		case "months":
			return durationUnit * monthDuration;
		case "weeks":
			return durationUnit * weekDuration;
		case "days":
			return durationUnit * dayDuration;
		case "hours":
			return durationUnit * hourDuration;
		case "minutes":
			return durationUnit * minuteDuration;
		case "seconds":
			return durationUnit * secondDuration;
	}
};

export const unitToString: Record<TimeUnit, string> = {
	years: "an",
	months: "mois",
	weeks: "semaine",
	days: "jour",
	hours: "heure",
	minutes: "minute",
	seconds: "seconde",
};

export const unitToStringPlural: Record<TimeUnit, string> = {
	years: "ans",
	months: "mois",
	weeks: "semaines",
	days: "jours",
	hours: "heures",
	minutes: "minutes",
	seconds: "secondes",
};

const assertUnreachable: (x: never) => never = () => {
	throw new Error("Didn't expect to get here");
};

export const relativeDurationToString = (
	durationUnit: number,
	unit: TimeUnit,
): string => {
	switch (unit) {
		case "years": {
			if (durationUnit <= -2) {
				return `il y a ${-durationUnit} ans`;
			} else if (durationUnit === -1) {
				return "l’an dernier";
			} else if (durationUnit === 0) {
				return "cette année";
			} else if (durationUnit === 1) {
				return "l’an prochain";
			} else {
				return `dans ${durationUnit} ans`;
			}
		}
		case "months": {
			const inYears = Math.round(durationUnit / 12);
			if (Math.abs(inYears) >= 2) {
				return relativeDurationToString(inYears, "years");
			}
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
		}
		case "weeks": {
			const inMonths = Math.round(durationUnit / 4);
			if (Math.abs(inMonths) >= 2) {
				return relativeDurationToString(inMonths, "months");
			}
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
		}
		case "days": {
			const inWeeks = Math.round(durationUnit / 7);
			if (Math.abs(inWeeks) >= 2) {
				return relativeDurationToString(inWeeks, "weeks");
			}
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
		}
		case "hours": {
			const inDays = Math.round(durationUnit / 24);
			if (Math.abs(inDays) >= 2) {
				return relativeDurationToString(inDays, "days");
			}
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
		}
		case "minutes": {
			const inHours = Math.round(durationUnit / 60);
			if (Math.abs(inHours) >= 2) {
				return relativeDurationToString(inHours, "hours");
			}
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
		}
		case "seconds": {
			const inMinutes = Math.round(durationUnit / 60);
			if (Math.abs(inMinutes) >= 2) {
				return relativeDurationToString(inMinutes, "minutes");
			}
			if (durationUnit <= -2) {
				return `il y a ${-durationUnit} secondes`;
			} else if (durationUnit === -1) {
				return `il y a une seconde`;
			} else if (durationUnit === 0) {
				return "immédiatement";
			} else if (durationUnit === 1) {
				return `dans une seconde`;
			} else {
				return `dans ${durationUnit} secondes`;
			}
		}
		default:
			assertUnreachable(unit);
	}
};

const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
	dateStyle: "full",
	timeStyle: "short",
});

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" });

export const timeToString = (time: number, unit: TimeUnit) => {
	const timeUnit = convertToUnit(time, unit);
	const date = new Date(convertFromUnit(timeUnit, unit));
	switch (unit) {
		case "years":
			return `en ${timeUnit}`;
		case "months": {
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
		}
		case "weeks":
			return `la semaine du ${dateFormat.format(date)}`;
		case "days":
			return `le ${dateFormat.format(date)}`;
		case "hours":
			return `le ${dateTimeFormat.format(date)}`;
		case "minutes":
			return `le ${dateTimeFormat.format(date)}`;
		case "seconds":
			return `le ${dateTimeFormat.format(date)}`;
		default:
			assertUnreachable(unit);
	}
};

export const durationUnitToString = (durationUnit: number, unit: TimeUnit) => {
	return `${durationUnit} ${durationUnit == 1 ? unitToString[unit] : unitToStringPlural[unit]}`;
};
