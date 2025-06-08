import { query, mutation, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { vUnit } from "./schema";
import { TimeUnit } from "../src/units";
import { Accomplishment, parseAccomplishment } from "./accomplishments";

/** Helper functions */

// A task, format used by the frontend
export type Task = {
	id: Id<"tasks">;
	name: string;
	description?: string;
	unit: TimeUnit;
	period: number;
	tolerance: number;
	visibleTo?: Id<"users">[];
	responsibleFor?: Id<"users">[];
	lastCompletionTime?: number;
	toBeCompletedBy?: Id<"users">;
	accomplishments: Accomplishment[];
};

// Returns the last completion time of a task
const getLastCompletionTime = (
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
const getToBeCompletedBy = (
	responsibleFor: Id<"users">[] | undefined,
	accomplishments: Accomplishment[],
): Id<"users"> | undefined => {
	if (!responsibleFor || responsibleFor.length === 0) {
		return;
	}
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
		lastCompletionTime: getLastCompletionTime(accomplishments),
		toBeCompletedBy: getToBeCompletedBy(
			task.responsibleFor,
			accomplishments,
		),
		accomplishments,
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
		};

		if (args.id) {
			await ctx.db.patch(args.id, data);
		} else {
			await ctx.db.insert("tasks", data);
		}
	},
});
