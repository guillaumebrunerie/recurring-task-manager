import { Doc } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { parseUser } from "./users";
import { parseTask } from "./tasks";

import { Accomplishment } from "@/shared/accomplishments";

/** Helper functions */

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
		completedBy: userDoc ? parseUser(userDoc) : undefined,
		timeLeft: accomplishment.timeLeft,
		unit: accomplishment.unit,
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
			throw new Error(
				`Task with id ${taskId} is not visible to user ${userId}`,
			);
		}
		await ctx.db.insert("accomplishments", {
			taskId,
			completionTime,
			completedBy: userId,
			unit: task.unit,
		});
	},
});

export const deleteAccomplishment = mutation({
	args: {
		accomplishmentId: v.id("accomplishments"),
	},
	handler: async (ctx, { accomplishmentId }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("User not authenticated");
		}
		await ctx.db.delete(accomplishmentId);
	},
});
