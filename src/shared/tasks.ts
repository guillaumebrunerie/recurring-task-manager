import type { Id } from "@/convex/_generated/dataModel";
import { convertToUnit, type TimeUnit } from "./units";
import type { User } from "./users";

export type Task = {
	id: Id<"tasks">;
	name: string;
	description?: string;
	unit: TimeUnit;
	period: number;
	toleranceUnit: TimeUnit;
	tolerance: number;
	visibleTo: User[];
	responsibleFor: User[];
	isJoint: boolean;
	isFixedSchedule: boolean;
	toBeDoneTime?: number;
	toBeCompletedBy: User[];
	lastNotified?: number;
	isArchived: boolean;
	archivedAt?: number;
};

export const defaultCompletedBy = (task: Task, userId: Id<"users">) => {
	if (task.isJoint) {
		return task.responsibleFor.map((user) => user.id);
	} else {
		return [userId];
	}
};

type TaskStatus =
	| "veryLate" // Task is very late
	| "late" // Task is late
	| "dueNow" // Task is due now (or needs to be completed in the near future)
	| "dueSoon" // Task will be due soon (it is not currently due)
	| "waiting" // Task does not need to be completed again for now
	| "archived"; // Task is archived

export const taskStatus = (task: Task, now: number): TaskStatus => {
	if (task.isArchived && task.archivedAt) {
		return "archived";
	}
	if (task.toBeDoneTime === undefined) {
		return "waiting";
	}

	const toBeDoneTimeInUnit = convertToUnit(
		task.toBeDoneTime,
		task.toleranceUnit,
	);
	const nowInUnit = convertToUnit(now, task.toleranceUnit);
	const delta = toBeDoneTimeInUnit - nowInUnit;

	// If tolerance is 0, it is:
	// - never due soon, due at 0, late at -1, very late at -2
	// If tolerance is 1, it is:
	// - due soon at 1, due at 0/-1, late at -2/-3, very late at -4/-5
	// If tolerance is 2, it is:
	// - due soon at 2/1, due at 0/-1/-2, late at -3/-4/-5, very late at -6/-7/-8
	if (delta <= -(task.tolerance + 1) * 2) {
		return "veryLate";
	} else if (delta <= -(task.tolerance + 1)) {
		return "late";
	} else if (delta <= 0) {
		return "dueNow";
	} else if (delta <= task.tolerance) {
		return "dueSoon";
	} else {
		return "waiting";
	}
};

export const isTaskLate = (task: Task, now: number) => {
	const status = taskStatus(task, now);
	return status === "late" || status === "veryLate";
};

export const taskTimeDifferenceInUnit = (task: Task, now: number) => {
	if (task.isArchived && task.archivedAt) {
		return null;
	}
	if (task.toBeDoneTime === undefined) {
		return null;
	}

	return (
		convertToUnit(task.toBeDoneTime, task.toleranceUnit) -
		convertToUnit(now, task.toleranceUnit)
	);
};

export const compareTasks = (taskA: Task, taskB: Task, now: number) => {
	const statusA = taskStatus(taskA, now);
	const statusB = taskStatus(taskB, now);
	const statusOrder: TaskStatus[] = [
		"veryLate",
		"late",
		"dueNow",
		"dueSoon",
		"waiting",
		"archived",
	];
	if (statusA !== statusB) {
		return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB);
	} else {
		const timeA = taskA.toBeDoneTime || Infinity;
		const timeB = taskB.toBeDoneTime || Infinity;
		return timeA - timeB;
	}
};

export const shouldNotifyForTask = ({
	task,
	now,
	ignoreLastNotified,
}: {
	task: Task;
	now: number;
	ignoreLastNotified: boolean;
}) => {
	if (!task.toBeDoneTime) {
		return false;
	}
	if (task.isArchived) {
		return false;
	}
	const desiredTime = convertToUnit(task.toBeDoneTime, task.toleranceUnit);
	const nowUnit = convertToUnit(now, task.toleranceUnit);
	const notifiedAt =
		task.lastNotified ?
			convertToUnit(task.lastNotified, task.toleranceUnit)
		:	-Infinity;
	if (nowUnit < desiredTime) {
		return false; // No notification yet
	}
	if (nowUnit - notifiedAt <= task.tolerance && !ignoreLastNotified) {
		return false; // Already notified within tolerance
	}
	return true;
};
