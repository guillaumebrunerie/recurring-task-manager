import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";

import type { User } from "@/shared/users";

/** Helper functions */

export const parseUser = (user: Doc<"users">): User => ({
	id: user._id,
	name: user.name,
	image: user.image,
});

export const getUser = async (
	ctx: QueryCtx,
	userId: Id<"users">,
): Promise<User> => {
	const user = await ctx.db.get("users", userId);
	if (!user) {
		throw new Error(`User with id ${userId} not found`);
	}
	return parseUser(user);
};

export const getUsers = async (
	ctx: QueryCtx,
	userIds: Id<"users">[],
): Promise<User[]> => {
	return Promise.all(userIds.map((userId) => getUser(ctx, userId)));
};

/** Queries */

export const getUserQuery = query({
	args: { userId: v.optional(v.id("users")) },
	handler: async (ctx, { userId }) => {
		return userId ? getUser(ctx, userId) : undefined;
	},
});

export const getCurrentUserQuery = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return;
		}
		const user = await ctx.db.get("users", userId);
		if (!user) {
			return;
		}
		return parseUser(user);
	},
});

export const getAllUsersQuery = query({
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
