import { Id } from "@/convex/_generated/dataModel";
import {
	convertToUnit,
	getMaxTimeLeft,
	getMinTimeLeft,
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
	toBeDoneTime?: number;
	toBeCompletedBy: Id<"users">;
	accomplishments: Accomplishment[];
	lastNotified?: number;
	isArchived: boolean;
	archivedAt?: number;
};

export type TaskStatus =
	| "overdue" // Task is overdue
	| "due" // Task is due now or soon
	| "waiting" // Task does not need to be completed again for now
	| "archived"; // Task is archived

export const taskStatus = (task: Task, now: number): TaskStatus => {
	if (task.isArchived && task.archivedAt) {
		return "archived";
	}
	if (task.toBeDoneTime === undefined) {
		return "waiting";
	}
	const minTimeLeft = getMinTimeLeft(task, task.toBeDoneTime);
	const maxTimeLeft = getMaxTimeLeft(task, task.toBeDoneTime);

	if (maxTimeLeft < now) {
		return "overdue";
	} else if (minTimeLeft > now) {
		return "waiting";
	} else {
		return "due";
	}
};

export const taskTimeDifferenceInUnit = (task: Task, now: number) => {
	if (task.isArchived && task.archivedAt) {
		return null;
	}
	if (task.toBeDoneTime === undefined) {
		return null;
	}

	return (
		convertToUnit(task.toBeDoneTime, task.unit) -
		convertToUnit(now, task.unit)
	);
};

export const compareTasks = (taskA: Task, taskB: Task, now: number) => {
	const statusA = taskStatus(taskA, now);
	const statusB = taskStatus(taskB, now);
	const statusOrder: TaskStatus[] = ["overdue", "due", "waiting", "archived"];
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
	const desiredTime = convertToUnit(task.toBeDoneTime, task.unit);
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
