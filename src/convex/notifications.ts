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
	const count = overdueTasks.length + dueTasks.length;
	if (count === 0) {
		return;
	}
	const title =
		`${count} tâche${count > 1 ? "s" : ""} à faire` +
		(overdueTasks.length > 0 ? ` (${overdueTasks.length} en retard)` : "");
	const body = [
		...overdueTasks.map((task) => `⚠️ ${task.name}`),
		...dueTasks.map((task) => `⏳ ${task.name}`),
	].join("\n");
	await sendNotification(title, body, subscription);
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
