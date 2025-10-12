import type { Doc } from "./_generated/dataModel";
import { internalMutation, mutation, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { selectUsers } from "./users";
import { calculateToBeDoneTime, parseTask } from "./tasks";

import {
	type Accomplishment,
	getNewResponsibles,
} from "@/shared/accomplishments";
import { defaultCompletedBy } from "@/shared/tasks";
/** Helper functions */

// Parses an accomplishment document into an Accomplishment object
export const parseAccomplishment = async (
	ctx: QueryCtx,
	accomplishment: Doc<"accomplishments">,
): Promise<Accomplishment> => {
	return {
		id: accomplishment._id,
		completionTime: accomplishment.completionTime,
		completedBy: await selectUsers(ctx, accomplishment.completedBy),
	};
};

/** Mutations */

const getUserId = async (ctx: QueryCtx, token?: string) => {
	if (token) {
		const result = await ctx.db
			.query("subscriptions")
			.filter((q) => q.eq(q.field("subscription"), token))
			.unique();
		return result?.userId;
	} else {
		return await getAuthUserId(ctx);
	}
};

// Adds an accomplishment for a task
export const addAccomplishment = mutation({
	args: {
		taskId: v.id("tasks"),
		completionTime: v.optional(v.number()),
		updateToBeDoneTime: v.boolean(),
		completedBy: v.optional(v.array(v.id("users"))),
		token: v.optional(v.string()), // For push notifications
	},
	handler: async (
		ctx,
		{
			taskId,
			completionTime = Date.now(),
			updateToBeDoneTime,
			completedBy,
			token,
		},
	) => {
		const userId = await getUserId(ctx, token);
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
			completedBy: completedBy || defaultCompletedBy(task, userId),
		});
		await ctx.db.patch(taskId, {
			responsibleFor: await getNewResponsibles(ctx, taskDoc),
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

export const normalizeAccomplishments = internalMutation({
	handler: async (ctx) => {
		const allAccomplishments = await ctx.db
			.query("accomplishments")
			.collect();
		for (const accomplishment of allAccomplishments) {
			if (Array.isArray(accomplishment.completedBy)) {
				continue;
			}
			await ctx.db.patch(accomplishment._id, {
				completedBy:
					accomplishment.completedBy ?
						[accomplishment.completedBy]
					:	[],
			});
		}
	},
});
