import { TimeUnit } from "../src/units";
import { Doc, Id } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { parseUser, User } from "./users";
import { getAuthUserId } from "@convex-dev/auth/server";
import { parseTask } from "./tasks";
import { getTimeLeftForAccomplishment } from "../src/tasks";

/** Helper functions */

// An accomplishment, format used by the frontend
export type Accomplishment = {
	id: Id<"accomplishments">;
	completionTime: number;
	completedBy: User | null;
	timeLeft: number | null;
	unit: TimeUnit | null;
};

// Parses an accomplishment document into an Accomplishment object
export const parseAccomplishment = async (
	ctx: QueryCtx,
	accomplishment: Doc<"accomplishments">,
): Promise<Accomplishment> => {
	const userDoc =
		accomplishment.completedBy ?
			await ctx.db.get(accomplishment.completedBy)
		:	null;
	return {
		id: accomplishment._id,
		completionTime: accomplishment.completionTime,
		completedBy: userDoc ? parseUser(userDoc) : null,
		timeLeft: accomplishment.timeLeft || null,
		unit: accomplishment.unit || null,
	};
};

/** Mutations */

// Adds an accomplishment for a task
export const addAccomplishment = mutation({
	args: {
		taskId: v.id("tasks"),
		completionTime: v.number(),
	},
	handler: async (ctx, { taskId, completionTime }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("User not authenticated");
		}
		const taskDoc = await ctx.db.get(taskId);
		if (!taskDoc) {
			throw new Error(`Task with id ${taskId} not found`);
		}
		const task = await parseTask(ctx, userId, taskDoc);
		if (!task) {
			throw new Error(`Task with id ${taskId} is not accessible`);
		}
		if (task.visibleTo && !task.visibleTo.includes(userId)) {
			throw new Error(
				`Task with id ${taskId} is not visible to user ${userId}`,
			);
		}
		await ctx.db.insert("accomplishments", {
			taskId,
			completionTime,
			completedBy: userId,
			timeLeft: getTimeLeftForAccomplishment(task, completionTime),
			unit: task.unit,
		});
	},
});
