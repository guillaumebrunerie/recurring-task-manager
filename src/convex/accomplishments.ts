import { Doc } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { parseUser } from "./users";
import { calculateToBeDoneTime, parseTask } from "./tasks";

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
		unit: accomplishment.unit,
	};
};

/** Mutations */

// Adds an accomplishment for a task
export const addAccomplishment = mutation({
	args: {
		taskId: v.id("tasks"),
		completionTime: v.optional(v.number()),
		updateToBeDoneTime: v.boolean(),
	},
	handler: async (
		ctx,
		{ taskId, completionTime = Date.now(), updateToBeDoneTime },
	) => {
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
		if (updateToBeDoneTime) {
			await ctx.db.patch(taskId, {
				toBeDoneTime: await calculateToBeDoneTime(ctx, taskDoc),
			});
		}
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
		const accomplishmentDoc = await ctx.db.get(accomplishmentId);
		if (!accomplishmentDoc) {
			throw new Error(
				`Accomplishment with id ${accomplishmentId} not found`,
			);
		}

		// Delete the accomplishment
		await ctx.db.delete(accomplishmentId);

		const taskId = accomplishmentDoc.taskId;
		const taskDoc = await ctx.db.get(taskId);
		if (!taskDoc) {
			throw new Error(`Task with id ${taskId} not found`);
		}

		// Recalculate the toBeDoneTime for the task
		await ctx.db.patch(taskId, {
			toBeDoneTime: await calculateToBeDoneTime(ctx, taskDoc),
		});
	},
});
