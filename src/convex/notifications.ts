"use node";

import webpush from "web-push";

import { ActionCtx, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

/** Configuration */

webpush.setVapidDetails(
	"mailto:guillaume.brunerie@gmail.com",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!,
);

/** Helper functions */

const sendNotification = async (
	title: string,
	body: string,
	subscription: string,
) => {
	try {
		console.log("Sending notification", title, body);
		await webpush.sendNotification(
			JSON.parse(subscription),
			JSON.stringify({
				title,
				body,
				icon: "/icon.png",
			}),
		);
		return { success: true };
	} catch (error) {
		console.error("Error sending push notification:", error);
		return { success: false, error: "Failed to send notification" };
	}
};

const notifyUser = async (
	ctx: ActionCtx,
	{ userId, subscription }: Doc<"subscriptions">,
) => {
	const { overdueTasks, dueTasks } = await ctx.runQuery(
		internal.tasks.getTasksToDoForUser,
		{ userId },
	);
	if (overdueTasks.length > 0) {
		await sendNotification(
			`⚠️ ${overdueTasks.length} tâche${overdueTasks.length > 1 ? "s" : ""} en retard!`,
			overdueTasks.map((task) => `${task.name}`).join("\n"),
			subscription,
		);
	}
	if (dueTasks.length > 0) {
		await sendNotification(
			`${dueTasks.length} tâche${dueTasks.length > 1 ? "s" : ""} à faire`,
			dueTasks.map((task) => `${task.name}`).join("\n"),
			subscription,
		);
	}
};

/** Actions */

export const notifyAllUsers = internalAction({
	handler: async (ctx) => {
		const subscriptions = await ctx.runQuery(
			internal.subscriptions.getAllSubscriptions,
		);
		for (const subscription of subscriptions) {
			await notifyUser(ctx, subscription);
		}
	},
});
