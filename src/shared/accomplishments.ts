import { Id } from "@/convex/_generated/dataModel";
import { User } from "./users";
import { TimeUnit } from "./units";

// An accomplishment, format used by the frontend
export type Accomplishment = {
	id: Id<"accomplishments">;
	completionTime: number;
	completedBy?: User;
	unit?: TimeUnit;
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
