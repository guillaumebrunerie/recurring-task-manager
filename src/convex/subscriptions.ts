import { internalQuery } from "./_generated/server";

/** Queries */

export const getAllSubscriptions = internalQuery({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("subscriptions").collect();
	},
});
