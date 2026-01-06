import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internalMutation, internalQuery, mutation } from "./_generated/server";

import { getUser } from "./users";

/** Queries */

export const getAllSubscriptions = internalQuery({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("subscriptions").collect();
	},
});

export const getByUserName = internalQuery({
	args: { userName: v.string() },
	handler: async (ctx, { userName }) => {
		const allSubscriptions = await ctx.db.query("subscriptions").collect();
		const subscriptions = await Promise.all(
			allSubscriptions.map(async (subscription) => {
				const user = await getUser(ctx, subscription.userId);
				if (user.name === userName) {
					return subscription;
				}
				return null;
			}),
		);
		return subscriptions.filter((s) => s !== null);
	},
});

/** Mutations */

export const subscribe = mutation({
	args: { subscription: v.string() },
	handler: async (ctx, { subscription }) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return [];
		}
		await ctx.db.insert("subscriptions", { userId, subscription });
	},
});

export const unsubscribe = mutation({
	args: { subscription: v.string() },
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
			await ctx.db.delete("subscriptions", existingSubscription._id);
		}
	},
});

export const removeSubscription = internalMutation({
	args: { subscription: v.string() },
	handler: async (ctx, { subscription }) => {
		const existingSubscription = await ctx.db
			.query("subscriptions")
			.filter((q) => q.eq(q.field("subscription"), subscription))
			.unique();
		if (!existingSubscription) {
			console.log("Subscription not found:", subscription);
			return;
		}
		await ctx.db.delete("subscriptions", existingSubscription._id);
	},
});
