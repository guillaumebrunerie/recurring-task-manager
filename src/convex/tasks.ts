import {
	query,
	mutation,
	QueryCtx,
	internalQuery,
	internalMutation,
	MutationCtx,
} from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { vUnit } from "./schema";
import { parseAccomplishment } from "./accomplishments";

import { getToBeCompletedBy } from "@/shared/accomplishments";
import {
	compareTasks,
	shouldNotifyForTask,
	Task,
	taskStatus,
} from "@/shared/tasks";
import { convertDurationFromUnit } from "@/shared/units";

/** Helper functions */

// Parses a task document into a Task object
export const parseTask = async (
	ctx: QueryCtx,
	userId: Id<"users">,
	task: Doc<"tasks">,
): Promise<Task | undefined> => {
	if (task.visibleTo && !task.visibleTo.includes(userId)) {
		return;
	}
	const accomplishmentDocs = await ctx.db
		.query("accomplishments")
		.filter((q) => q.eq(q.field("taskId"), task._id))
		.collect();

	const accomplishments = await Promise.all(
		accomplishmentDocs
			.toSorted((a, b) => b.completionTime - a.completionTime)
			.map((a) => parseAccomplishment(ctx, a)),
	);
	return {
		id: task._id,
		name: task.name,
		description: task.description,
		unit: task.unit,
		period: task.period,
		tolerance: task.tolerance,
		visibleTo: task.visibleTo,
		responsibleFor: task.responsibleFor,
		toBeDoneTime: task.toBeDoneTime,
		toBeCompletedBy: getToBeCompletedBy(
			task.responsibleFor,
			accomplishments,
		),
		accomplishments,
		lastNotified: task.lastNotified,
		isArchived: task.archivedAt !== undefined,
		archivedAt: task.archivedAt,
	};
};

/** Queries */

// Returns a task by its ID
export const get = query({
	args: {
		id: v.optional(v.id("tasks")),
	},
	handler: async (ctx, { id }) => {
		if (!id) {
			return;
		}
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return;
		}
		const task = await ctx.db.get(id);
		if (!task) {
			throw new ConvexError(`Task with id ${id} not found`);
		}
		return await parseTask(ctx, userId, task);
	},
});

// Returns all tasks visible to the authenticated user
export const getAll = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return [];
		}
		const taskDocs = await ctx.db.query("tasks").collect();
		const tasks: (Task | undefined)[] = await Promise.all(
			taskDocs.map(
				async (taskDoc) => await parseTask(ctx, userId, taskDoc),
			),
		);
		return tasks.filter((task) => !!task);
	},
});

export const getTasksToNotifyForUser = internalQuery({
	args: {
		userId: v.id("users"),
		ignoreLastNotified: v.boolean(),
	},
	handler: async (ctx, { userId, ignoreLastNotified }) => {
		const now = Date.now();

		const taskDocs = await ctx.db.query("tasks").collect();
		const tasks: Task[] = (
			await Promise.all(
				taskDocs.map((taskDoc) => parseTask(ctx, userId, taskDoc)),
			)
		).filter(
			(task: Task | undefined): task is Task =>
				!!task &&
				task.toBeCompletedBy == userId &&
				shouldNotifyForTask({ task, now, ignoreLastNotified }),
		);

		tasks.sort((taskA, taskB) => compareTasks(taskA, taskB, now));
		tasks.reverse(); // Most urgent tasks last so that they appear first
		const overdueTasks = tasks.filter(
			(task) => taskStatus(task, now) === "overdue",
		);
		const dueTasks = tasks.filter(
			(task) => taskStatus(task, now) === "due",
		);

		return { overdueTasks, dueTasks };
	},
});

/** Mutations */

// Saves a task, either creating a new one or updating an existing one
export const saveTask = mutation({
	args: {
		id: v.optional(v.id("tasks")), // undefined for new task, id for existing task
		name: v.string(),
		description: v.optional(v.string()),
		period: v.number(),
		unit: vUnit,
		tolerance: v.number(),
		visibleTo: v.array(v.id("users")),
		responsibleFor: v.array(v.id("users")),
		toBeDoneTime: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const data = {
			name: args.name,
			description: args.description,
			period: args.period,
			unit: args.unit,
			tolerance: args.tolerance,
			visibleTo: args.visibleTo,
			responsibleFor: args.responsibleFor,
			toBeDoneTime: args.toBeDoneTime,
		};

		if (args.id) {
			await ctx.db.patch(args.id, data);
		} else {
			await ctx.db.insert("tasks", data);
		}
	},
});

export const markTasksAsNotified = internalMutation({
	args: {
		ids: v.array(v.id("tasks")),
		now: v.number(),
	},
	handler: async (ctx, { ids, now }) => {
		await Promise.all(
			ids.map(async (id) => {
				const task = await ctx.db.get(id);
				if (!task) {
					throw new ConvexError(`Task with id ${id} not found`);
				}
				await ctx.db.patch(id, { lastNotified: now });
			}),
		);
	},
});

export const archiveTask = mutation({
	args: { id: v.id("tasks") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			archivedAt: Date.now(),
		});
	},
});

export const unarchiveTask = mutation({
	args: { id: v.id("tasks") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			archivedAt: undefined,
		});
	},
});

export const deleteTask = mutation({
	args: { id: v.id("tasks") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});

export const calculateToBeDoneTime = async (
	ctx: MutationCtx,
	taskDoc: Doc<"tasks">,
) => {
	const accomplishmentDocs = await ctx.db
		.query("accomplishments")
		.filter((q) => q.eq(q.field("taskId"), taskDoc._id))
		.collect();
	const accomplishments = await Promise.all(
		accomplishmentDocs
			.toSorted((a, b) => b.completionTime - a.completionTime)
			.map((a) => parseAccomplishment(ctx, a)),
	);

	if (accomplishments.length == 0) {
		return Date.now();
	}
	if (taskDoc.period == 0) {
		return undefined;
	}

	const lastAccomplishmentTime = accomplishments
		.map((a) => a.completionTime)
		.reduce((a, b) => Math.max(a, b));

	return (
		lastAccomplishmentTime +
		convertDurationFromUnit(taskDoc.period, taskDoc.unit)
	);
};

export const resetToBeDoneTime = mutation({
	args: { id: v.id("tasks") },
	handler: async (ctx, args) => {
		const taskDoc = await ctx.db.get(args.id);
		if (!taskDoc) {
			throw new ConvexError(`Task with id ${args.id} not found`);
		}
		const toBeDoneTime = await calculateToBeDoneTime(ctx, taskDoc);
		await ctx.db.patch(args.id, { toBeDoneTime });
	},
});

/** Migrations */

export const populateToBeDoneTime = internalMutation({
	handler: async (ctx) => {
		const taskDocs = await ctx.db.query("tasks").collect();
		await Promise.all(
			taskDocs.map(async (task) => {
				if (
					task.toBeDoneTime !== undefined ||
					task.archivedAt !== undefined
				) {
					return;
				}
				const toBeDoneTime = await calculateToBeDoneTime(ctx, task);

				await ctx.db.patch(task._id, { toBeDoneTime });
			}),
		);
	},
});
