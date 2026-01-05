import {
	query,
	mutation,
	type QueryCtx,
	internalQuery,
	internalMutation,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { vUnit } from "./schema";
import { parseAccomplishment } from "./accomplishments";

import {
	compareTasks,
	shouldNotifyForTask,
	type Task,
	taskStatus,
} from "@/shared/tasks";
import { convertDurationFromUnit } from "@/shared/units";
import { getUsers } from "./users";
import type { Accomplishment } from "@/shared/accomplishments";

/** Helper functions */

// Returns the accomplishments for a task
export const getTaskAccomplishments = async (
	ctx: QueryCtx,
	taskDoc: Doc<"tasks">,
): Promise<Accomplishment[]> => {
	const accomplishmentDocs = await ctx.db
		.query("accomplishments")
		.withIndex("by_taskId", (q) => q.eq("taskId", taskDoc._id))
		.collect();

	return Promise.all(
		accomplishmentDocs
			.sort((a, b) => b.completionTime - a.completionTime)
			.map((a) => parseAccomplishment(ctx, a)),
	);
};

// Parses a task document into a Task object
export const parseTask = async (
	ctx: QueryCtx,
	userId: Id<"users">,
	task: Doc<"tasks">,
): Promise<Task | undefined> => {
	if (!task.visibleTo.includes(userId)) {
		return;
	}
	const [visibleTo, responsibleFor] = await Promise.all([
		getUsers(ctx, task.visibleTo),
		getUsers(ctx, task.responsibleFor),
	]);
	return {
		id: task._id,
		name: task.name,
		description: task.description,
		unit: task.unit,
		period: task.period,
		toleranceUnit: task.toleranceUnit || task.unit,
		tolerance: task.tolerance,
		visibleTo,
		responsibleFor,
		toBeDoneTime: task.toBeDoneTime,
		toBeCompletedBy:
			task.isJoint ? responsibleFor
			: responsibleFor.length == 0 ? []
			: [responsibleFor[0]],
		isJoint: task.isJoint || false,
		isFixedSchedule: task.isFixedSchedule || false,
		lastNotified: task.lastNotified,
		isArchived: task.archivedAt !== undefined,
		archivedAt: task.archivedAt,
	};
};

/** Queries */

// Returns a task by its ID
export const get = query({
	args: { id: v.optional(v.id("tasks")) },
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

// Returns the accomplishments of a task
export const getAccomplishments = query({
	args: { id: v.optional(v.id("tasks")) },
	handler: async (ctx, { id }) => {
		if (!id) {
			return;
		}
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return;
		}
		const taskDoc = await ctx.db.get(id);
		if (!taskDoc) {
			throw new ConvexError(`Task with id ${id} not found`);
		}
		return await getTaskAccomplishments(ctx, taskDoc);
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
	args: { userId: v.id("users"), ignoreLastNotified: v.boolean() },
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
				task.toBeCompletedBy.some((u) => u.id == userId) &&
				shouldNotifyForTask({ task, now, ignoreLastNotified }),
		);

		tasks.sort((taskA, taskB) => compareTasks(taskA, taskB, now));
		tasks.reverse(); // Most urgent tasks last so that they appear first
		const overdueTasks = tasks.filter((task) =>
			["veryLate", "late"].includes(taskStatus(task, now)),
		);
		const dueTasks = tasks.filter((task) =>
			["dueNow", "dueSoon"].includes(taskStatus(task, now)),
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
		unit: vUnit,
		period: v.number(),
		toleranceUnit: vUnit,
		tolerance: v.number(),
		visibleTo: v.array(v.id("users")),
		responsibleFor: v.array(v.id("users")),
		isJoint: v.boolean(),
		isFixedSchedule: v.boolean(),
		toBeDoneTime: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const data = {
			name: args.name,
			description: args.description,
			unit: args.unit,
			period: args.period,
			toleranceUnit: args.toleranceUnit,
			tolerance: args.tolerance,
			visibleTo: args.visibleTo,
			responsibleFor: args.responsibleFor,
			isJoint: args.isJoint,
			isFixedSchedule: args.isFixedSchedule,
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
	args: { ids: v.array(v.id("tasks")), now: v.number() },
	handler: async (ctx, { ids, now }) => {
		for (const id of ids) {
			await ctx.db.patch(id, { lastNotified: now });
		}
	},
});

export const archiveTask = mutation({
	args: { id: v.id("tasks") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { archivedAt: Date.now() });
	},
});

export const unarchiveTask = mutation({
	args: { id: v.id("tasks") },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { archivedAt: undefined });
	},
});

export const deleteTask = mutation({
	args: { id: v.id("tasks") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});

export const calculateToBeDoneTimeFixed = (task: Task) => {
	if (!task.isFixedSchedule) {
		throw new Error("Task is not on a fixed schedule");
	}
	if (task.period == 0) {
		return undefined;
	}
	if (!task.toBeDoneTime) {
		return Date.now();
	}
	return task.toBeDoneTime + convertDurationFromUnit(task.period, task.unit);
};

export const calculateToBeDoneTime = async (
	ctx: QueryCtx,
	taskDoc: Doc<"tasks">,
) => {
	if (taskDoc.period == 0) {
		return undefined;
	}

	if (taskDoc.isFixedSchedule) {
		if (!taskDoc.toBeDoneTime) {
			return Date.now();
		}
		return (
			taskDoc.toBeDoneTime +
			convertDurationFromUnit(taskDoc.period, taskDoc.unit)
		);
	} else {
		const accomplishments = await getTaskAccomplishments(ctx, taskDoc);

		if (accomplishments.length == 0) {
			return Date.now();
		}

		const lastAccomplishmentTime = accomplishments
			.map((a) => a.completionTime)
			.reduce((a, b) => Math.max(a, b));

		return (
			lastAccomplishmentTime +
			convertDurationFromUnit(taskDoc.period, taskDoc.unit)
		);
	}
};

// export const resetToBeDoneTime = mutation({
// 	args: { id: v.id("tasks") },
// 	handler: async (ctx, args) => {
// 		const taskDoc = await ctx.db.get(args.id);
// 		if (!taskDoc) {
// 			throw new ConvexError(`Task with id ${args.id} not found`);
// 		}
// 		const toBeDoneTime = await calculateToBeDoneTime(ctx, taskDoc);
// 		await ctx.db.patch(args.id, { toBeDoneTime });
// 	},
// });
