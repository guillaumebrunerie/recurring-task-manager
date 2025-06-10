import { query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { User } from "@/shared/users";

export const parseUser = (user: Doc<"users">): User => ({
	id: user._id,
	name: user.name,
	image: user.image,
});

export const getUser = query({
	args: { userId: v.optional(v.id("users")) },
	handler: async (ctx, { userId }) => {
		if (!userId) {
			return;
		}
		const user = await ctx.db.get(userId);
		if (!user) {
			return;
		}
		return parseUser(user);
	},
});

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return;
		}
		const user = await ctx.db.get(userId);
		if (!user) {
			return;
		}
		return parseUser(user);
	},
});

export const getAll = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return [];
		}
		const users = await ctx.db.query("users").collect();
		return users.map((user) => parseUser(user));
	},
});
