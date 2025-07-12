import { Id } from "@/convex/_generated/dataModel";
import {
	convertToUnit,
	getMaxTimeLeft,
	getMinTimeLeft,
	getTimeLeft,
	TimeUnit,
} from "./units";
import { Accomplishment } from "./accomplishments";

export type Task = {
	id: Id<"tasks">;
	name: string;
	description?: string;
	unit: TimeUnit;
	period: number;
	tolerance: number;
	visibleTo: Id<"users">[];
	responsibleFor: Id<"users">[];
	lastCompletionTime?: number;
	toBeCompletedBy: Id<"users">;
	accomplishments: Accomplishment[];
	lastNotified?: number;
	isArchived: boolean;
	archivedAt?: number;
};

export type TaskStatus =
	| "new" // New task, never completed
	| "overdue" // Task is overdue
	| "due" // Task is due now or soon
	| "waiting" // Task does not need to be completed again for now
	| "archived"; // Task is archived

export const taskStatus = (task: Task, now: number): TaskStatus => {
	if (task.isArchived && task.archivedAt) {
		return "archived";
	}
	if (task.lastCompletionTime == null) {
		return "new";
	}
	const minTimeLeft = getMinTimeLeft(task, task.lastCompletionTime);
	const maxTimeLeft = getMaxTimeLeft(task, task.lastCompletionTime);

	if (maxTimeLeft < now) {
		return "overdue";
	} else if (minTimeLeft > now) {
		return "waiting";
	} else {
		return "due";
	}
};

export const taskTimeDifferenceInUnit = (task: Task, now: number): number => {
	if (task.isArchived && task.archivedAt) {
		return 0;
	}
	if (task.lastCompletionTime == null) {
		return 0;
	}

	return (
		convertToUnit(task.lastCompletionTime, task.unit) +
		task.period -
		convertToUnit(now, task.unit)
	);
};

const taskPlannedTime = (task: Task) => {
	return getTimeLeft(task, task.lastCompletionTime || 0);
};

export const compareTasks = (taskA: Task, taskB: Task, now: number) => {
	const statusA = taskStatus(taskA, now);
	const statusB = taskStatus(taskB, now);
	const timeA = taskPlannedTime(taskA);
	const timeB = taskPlannedTime(taskB);
	const statusOrder: TaskStatus[] = [
		"overdue",
		"due",
		"new",
		"waiting",
		"archived",
	];
	if (statusA !== statusB) {
		return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB);
	} else {
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
	if (!task.lastCompletionTime) {
		return false;
	}
	if (task.isArchived) {
		return false;
	}
	const desiredTime =
		convertToUnit(task.lastCompletionTime, task.unit) + task.period;
	const nowUnit = convertToUnit(now, task.unit);
	const notifiedAt =
		task.lastNotified ?
			convertToUnit(task.lastNotified, task.unit)
		:	-Infinity;
	if (nowUnit < desiredTime) {
		return false; // No notification yet
	}
	if (nowUnit - notifiedAt <= task.tolerance && !ignoreLastNotified) {
		return false; // Already notified within tolerance
	}
	return true;
};
