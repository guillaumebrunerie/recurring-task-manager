import type { Doc } from "./_generated/dataModel";
import { mutation, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { getUsers } from "./users";
import {
	calculateToBeDoneTime,
	calculateToBeDoneTimeFixed,
	parseTask,
} from "./tasks";

import {
	type Accomplishment,
	getNewResponsibles,
} from "@/shared/accomplishments";
import { defaultCompletedBy, isTaskFailed } from "@/shared/tasks";

/** Helper functions */

const getUserIdFromSubscription = async (
	ctx: QueryCtx,
	subscription: string,
) => {
	const result = await ctx.db
		.query("subscriptions")
		.filter((q) => q.eq(q.field("subscription"), subscription))
		.unique();
	return result?.userId;
};

// Parses an accomplishment document into an Accomplishment object
export const parseAccomplishment = async (
	ctx: QueryCtx,
	accomplishment: Doc<"accomplishments">,
): Promise<Accomplishment> => {
	return {
		id: accomplishment._id,
		completionTime: accomplishment.completionTime,
		completedBy: await getUsers(ctx, accomplishment.completedBy),
		isFailed: accomplishment.isFailed || false,
	};
};

/** Mutations */

// Adds an accomplishment for a task
export const addAccomplishment = mutation({
	args: {
		taskId: v.id("tasks"),
		completionTime: v.optional(v.number()),
		updateToBeDoneTime: v.boolean(),
		completedBy: v.optional(v.array(v.id("users"))),
		subscription: v.optional(v.string()), // For push notifications
	},
	handler: async (
		ctx,
		{
			taskId,
			completionTime = Date.now(),
			updateToBeDoneTime,
			completedBy,
			subscription,
		},
	) => {
		const userId =
			subscription ?
				await getUserIdFromSubscription(ctx, subscription)
			:	await getAuthUserId(ctx);
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
		if (task.isFixedSchedule) {
			let infiniteLoopGuard = 0;
			while (
				infiniteLoopGuard < 100 &&
				isTaskFailed(task, completionTime) &&
				task.toBeDoneTime
			) {
				infiniteLoopGuard++;
				await ctx.db.insert("accomplishments", {
					taskId,
					completionTime: task.toBeDoneTime,
					completedBy: [],
					isFailed: true,
				});
				task.toBeDoneTime = calculateToBeDoneTimeFixed(task);
			}
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
				toBeDoneTime:
					task.isFixedSchedule ?
						calculateToBeDoneTimeFixed(task)
					:	await calculateToBeDoneTime(ctx, taskDoc),
			});
		}
	},
});

export const deleteAccomplishment = mutation({
	args: { accomplishmentId: v.id("accomplishments") },
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

		// Recalculate the toBeDoneTime and the responsibles for the task
		const [toBeDoneTime, responsibleFor] = await Promise.all([
			calculateToBeDoneTime(ctx, taskDoc),
			getNewResponsibles(ctx, taskDoc),
		]);
		await ctx.db.patch(taskId, { toBeDoneTime, responsibleFor });
	},
});
