import { DocumentByName, GenericQueryCtx } from "convex/server";
import { query, mutation } from "./_generated/server";
import { DataModel } from "./_generated/dataModel";
import { v } from "convex/values";

export const get = query({
	args: {
		id: v.optional(v.id("tasks")),
	},
	handler: async (ctx, { id }) => {
		if (!id) {
			return null;
		}
		const task = await ctx.db.get(id);
		if (!task) {
			throw new Error(`Task with id ${id} not found`);
		}
		return task;
	},
});

export type TaskWithLastCompletionTime = {
	task: DocumentByName<DataModel, "tasks">;
	lastCompletionTime: number | null;
};

export const getAllWithLastCompletionTime = query({
	args: {},
	handler: async (ctx) => {
		const tasks = await ctx.db.query("tasks").collect();
		const tasksWithLastCompletionTime: TaskWithLastCompletionTime[] =
			await Promise.all(
				tasks.map(async (task) => {
					const lastCompletionTime = await getLastCompletionTime(
						ctx,
						task,
					);
					return {
						task,
						lastCompletionTime,
					};
				}),
			);
		return tasksWithLastCompletionTime;
	},
});

const getLastCompletionTime = async (
	ctx: GenericQueryCtx<DataModel>,
	task: DocumentByName<DataModel, "tasks">,
) => {
	const accomplishments = await ctx.db
		.query("accomplishments")
		.filter((q) => q.eq(q.field("taskId"), task._id))
		.collect();
	if (accomplishments.length === 0) {
		return null;
	}
	return accomplishments
		.map((a) => a.completionTime)
		.reduce((a, b) => Math.max(a, b));
};

export const saveTask = mutation({
	args: {
		id: v.optional(v.id("tasks")),
		name: v.string(),
		description: v.optional(v.string()),
		period: v.number(),
		unit: v.union(
			v.literal("seconds"),
			v.literal("minutes"),
			v.literal("hours"),
			v.literal("days"),
			v.literal("weeks"),
		),
		tolerance: v.number(),
	},
	handler: async (ctx, args) => {
		const data = {
			name: args.name,
			description: args.description,
			period: args.period,
			unit: args.unit,
			tolerance: args.tolerance,
		};

		if (args.id) {
			await ctx.db.patch(args.id, data);
		} else {
			await ctx.db.insert("tasks", data);
		}
	},
});
