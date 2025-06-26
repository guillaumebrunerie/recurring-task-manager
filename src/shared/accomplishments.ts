import { Id } from "@/convex/_generated/dataModel";
import { User } from "./users";
import { TimeUnit } from "./units";
import { Task, taskStatus } from "./tasks";

// An accomplishment, format used by the frontend
export type Accomplishment = {
	id: Id<"accomplishments">;
	completionTime: number;
	completedBy?: User;
	timeLeft?: number;
	unit?: TimeUnit;
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
			return Infinity;
	}
};

// Returns the last completion time of a task
export const getLastCompletionTime = (
	accomplishments: Accomplishment[],
): number | undefined => {
	if (accomplishments.length === 0) {
		return;
	}
	return accomplishments
		.map((a) => a.completionTime)
		.reduce((a, b) => Math.max(a, b));
};

// Returns the user that should complete the task next
export const getToBeCompletedBy = (
	responsibleFor: Id<"users">[],
	accomplishments: Accomplishment[],
): Id<"users"> => {
	let responsibles = responsibleFor;
	const completedBy = accomplishments
		.toSorted((a, b) => b.completionTime - a.completionTime)
		.map((a) => a.completedBy);
	for (const user of completedBy) {
		if (responsibles.length == 1) {
			break;
		}
		responsibles = responsibles.filter((id) => id !== user?.id);
	}
	return responsibles[0];
};
