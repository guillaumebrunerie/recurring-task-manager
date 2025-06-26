import { Id } from "@/convex/_generated/dataModel";
import {
	convertDurationFromUnit,
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

export const taskStatus = (
	task: Task,
	now: number,
): { status: TaskStatus; time: number } => {
	if (task.isArchived && task.archivedAt) {
		return { status: "archived", time: task.archivedAt };
	}
	if (task.lastCompletionTime == null) {
		return {
			status: "new",
			time: convertDurationFromUnit(task.period, task.unit),
		};
	}
	const minTimeLeft = getMinTimeLeft(task, task.lastCompletionTime);
	const timeLeft = getTimeLeft(task, task.lastCompletionTime);
	const maxTimeLeft = getMaxTimeLeft(task, task.lastCompletionTime);
	if (maxTimeLeft < now) {
		return { status: "overdue", time: now - maxTimeLeft };
	}
	if (minTimeLeft > now) {
		return { status: "waiting", time: timeLeft - now };
	}
	return { status: "due", time: maxTimeLeft - now };
};

export const compareTasks = (taskA: Task, taskB: Task, now: number) => {
	const statusA = taskStatus(taskA, now);
	const statusB = taskStatus(taskB, now);
	const statusOrder: TaskStatus[] = [
		"overdue",
		"due",
		"new",
		"waiting",
		"archived",
	];
	if (statusA.status !== statusB.status) {
		return (
			statusOrder.indexOf(statusA.status) -
			statusOrder.indexOf(statusB.status)
		);
	} else {
		switch (statusA.status) {
			case "overdue":
				return statusB.time - statusA.time;
			case "new":
				return statusA.time - statusB.time;
			case "due":
				return statusA.time - statusB.time;
			case "waiting":
				return statusA.time - statusB.time;
			case "archived":
				return statusA.time - statusB.time;
		}
	}
};

export const getTimeLeftForAccomplishment = (
	task: Task,
	completionTime: number,
): number => {
	const { status, time } = taskStatus(task, completionTime);
	switch (status) {
		case "new":
			return 0;
		case "overdue":
			return -time;
		case "due":
			return 0;
		case "waiting":
			return time;
		case "archived":
			return 0;
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
