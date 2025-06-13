import { v } from "convex/values";
import { internalQuery, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Queries */

export const getAllSubscriptions = internalQuery({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("subscriptions").collect();
	},
});

/** Mutations */

export const subscribe = mutation({
	args: {
		subscription: v.string(),
	},
	handler: async (ctx, { subscription }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return [];
		}
		await ctx.db.insert("subscriptions", {
			userId,
			subscription,
		});
	},
});

export const unsubscribe = mutation({
	args: {
		subscription: v.string(),
	},
	handler: async (ctx, { subscription }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return [];
		}
		const existingSubscription = await ctx.db
			.query("subscriptions")
			.filter((q) =>
				q.and(
					q.eq(q.field("userId"), userId),
					q.eq(q.field("subscription"), subscription),
				),
			)
			.unique();
		if (existingSubscription) {
			await ctx.db.delete(existingSubscription._id);
		}
	},
});
