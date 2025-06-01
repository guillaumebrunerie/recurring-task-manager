import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addAccomplishment = mutation({
	args: {
		taskId: v.id("tasks"),
		completionTime: v.number(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("accomplishments", {
			taskId: args.taskId,
			completionTime: args.completionTime,
		});
	},
});

export const getTaskHistory = query({
	args: {
		taskId: v.id("tasks"),
	},
	handler: async (ctx, { taskId }) => {
		const taskHistory = await ctx.db
			.query("accomplishments")
			.filter((q) => q.eq(q.field("taskId"), taskId))
			.collect();
		taskHistory.sort((a, b) => b.completionTime - a.completionTime);
		return taskHistory;
	},
});
