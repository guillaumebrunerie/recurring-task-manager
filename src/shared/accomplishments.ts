import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { User } from "./users";
import type { MutationCtx } from "@/convex/_generated/server";
import { parseTaskAccomplishments } from "@/convex/tasks";

// An accomplishment, format used by the frontend
export type Accomplishment = {
	id: Id<"accomplishments">;
	completionTime: number;
	completedBy: User[];
};

// Returns a new ordering of the responsibleFor array after an accomplishment,
// so that the next person becomes first
export const getNewResponsibles = async (
	ctx: MutationCtx,
	taskDoc: Doc<"tasks">,
) => {
	const accomplishments = await parseTaskAccomplishments(ctx, taskDoc);
	let responsibles = taskDoc.responsibleFor;
	if (responsibles.length <= 1 || taskDoc.isJoint) {
		return responsibles;
	}

	outerLoop: for (const accomplishment of accomplishments) {
		for (const user of accomplishment.completedBy) {
			responsibles = responsibles.filter((id) => id !== user.id);
			if (responsibles.length == 1) {
				break outerLoop;
			}
		}
	}

	return [
		responsibles[0],
		...taskDoc.responsibleFor.filter((id) => id !== responsibles[0]),
	];
};
