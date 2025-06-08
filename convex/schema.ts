import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { units } from "../src/units";

export const vUnit = v.union(...units.map((unit) => v.literal(unit)));

export default defineSchema({
	...authTables,
	tasks: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		unit: vUnit,
		period: v.number(),
		tolerance: v.number(),
		visibleTo: v.optional(v.array(v.id("users"))),
		responsibleFor: v.optional(v.array(v.id("users"))),
	}),
	accomplishments: defineTable({
		taskId: v.id("tasks"),
		completionTime: v.number(),
		completedBy: v.optional(v.id("users")),
		timeLeft: v.optional(v.number()),
		unit: v.optional(vUnit),
	}),
});
