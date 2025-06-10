import { Id } from "@/convex/_generated/dataModel";
import {
	convertDurationFromUnit,
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
	visibleTo?: Id<"users">[];
	responsibleFor?: Id<"users">[];
	lastCompletionTime?: number;
	toBeCompletedBy?: Id<"users">;
	accomplishments: Accomplishment[];
};

export type TaskStatus =
	| "new" // New task, never completed
	| "overdue" // Task is overdue
	| "due" // Task is due now or soon
	| "waiting"; // Task does not need to be completed again for now

export const taskStatus = (
	task: Task,
	now: number,
): { status: TaskStatus; time: number } => {
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
	const statusOrder: TaskStatus[] = ["overdue", "due", "new", "waiting"];
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
	}
};
