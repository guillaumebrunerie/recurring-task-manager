import { query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { User } from "@/shared/users";

/** Helper functions */

export const parseUser = async (
	_ctx: QueryCtx,
	user: Doc<"users">,
): Promise<User> => ({
	id: user._id,
	name: user.name,
	image: user.image,
});

export const selectUser = async (
	ctx: QueryCtx,
	userId: Id<"users">,
): Promise<User> => {
	const user = await ctx.db.get(userId);
	if (!user) {
		throw new Error(`User with id ${userId} not found`);
	}
	return await parseUser(ctx, user);
};

export const selectUserMaybe = async (
	ctx: QueryCtx,
	userId?: Id<"users">,
): Promise<User | undefined> =>
	userId ? await selectUser(ctx, userId) : undefined;

export const selectUsers = async (
	ctx: QueryCtx,
	userIds: Id<"users">[],
): Promise<User[]> => {
	return Promise.all(
		userIds.map(async (userId) => await selectUser(ctx, userId)),
	);
};

/** Queries */

export const getUser = query({
	args: { userId: v.optional(v.id("users")) },
	handler: async (ctx, { userId }) => {
		return selectUserMaybe(ctx, userId);
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
		return await parseUser(ctx, user);
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
		return await Promise.all(
			users.map(async (user) => await parseUser(ctx, user)),
		);
	},
});
