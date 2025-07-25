import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { units } from "@/shared/units";

export const vUnit = v.union(...units.map((unit) => v.literal(unit)));

export default defineSchema({
	...authTables,
	tasks: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		unit: vUnit,
		period: v.number(),
		tolerance: v.number(),
		visibleTo: v.array(v.id("users")),
		responsibleFor: v.array(v.id("users")),
		lastNotified: v.optional(v.number()),
		archivedAt: v.optional(v.number()),
		toBeDoneTime: v.optional(v.number()),
	}),
	accomplishments: defineTable({
		taskId: v.id("tasks"),
		completionTime: v.number(),
		completedBy: v.optional(v.id("users")),
		unit: v.optional(vUnit),
	}),
	subscriptions: defineTable({
		userId: v.id("users"),
		subscription: v.string(),
	}),
});
