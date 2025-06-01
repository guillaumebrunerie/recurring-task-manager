import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	tasks: defineTable({
		task: v.string(),
		unit: v.union(
			v.literal("seconds"),
			v.literal("minutes"),
			v.literal("hours"),
			v.literal("days"),
			v.literal("weeks"),
		),
		period: v.number(),
		tolerance: v.number(),
	}),
	accomplishments: defineTable({
		taskId: v.id("tasks"),
		completionTime: v.number(),
	}),
});
