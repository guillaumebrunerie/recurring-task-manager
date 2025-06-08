import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export type User = {
	id: Id<"users">;
	name: string;
	image: string | null;
};

export const parseUser = (user: Doc<"users">): User => ({
	id: user._id,
	name: user.name || "(unknown)",
	image: user.image || null,
});

export const getUser = query({
	args: { userId: v.optional(v.id("users")) },
	handler: async (ctx, { userId }) => {
		if (!userId) {
			return null;
		}
		const user = await ctx.db.get(userId);
		if (!user) {
			return null;
		}
		return parseUser(user);
	},
});

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) {
			return null;
		}
		const user = await ctx.db.get(userId);
		if (!user) {
			return null;
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
