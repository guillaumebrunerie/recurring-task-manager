import { DocumentByName, GenericQueryCtx } from "convex/server";
import { query } from "./_generated/server";
import { DataModel } from "./_generated/dataModel";

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
