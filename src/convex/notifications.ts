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

const listify = (tasks: { name: string }[]) => {
	if (tasks.length === 1) {
		return `${tasks[0].name}`;
	}
	return tasks.map((task) => `- ${task.name}`).join("\n");
};

const countStr = (count: number, str: string) => {
	return `${count} ${str}${count > 1 ? "s" : ""}`;
};

const notifyUser = async (
	ctx: ActionCtx,
	{ userId, subscription }: Doc<"subscriptions">,
) => {
	const { overdueTasks, dueTasks } = await ctx.runQuery(
		internal.tasks.getTasksToNotifyForUser,
		{ userId },
	);
	console.log(
		`Notifying user ${userId}: ${overdueTasks.length} overdue, ${dueTasks.length} due`,
	);
	if (overdueTasks.length > 0) {
		await sendNotification(
			`⚠️ ${countStr(overdueTasks.length, "tâche")} en retard!`,
			listify(overdueTasks),
			subscription,
		);
	}
	if (dueTasks.length > 0) {
		await sendNotification(
			`${countStr(dueTasks.length, "tâche")} à faire`,
			listify(dueTasks),
			subscription,
		);
	}
	await ctx.runMutation(internal.tasks.markTasksAsNotified, {
		ids: [
			...overdueTasks.map((task) => task.id),
			...dueTasks.map((task) => task.id),
		],
		now: Date.now(),
	});
};

/** Actions */

const doNotDisturb = () => {
	const now = new Date();
	const hours = now.getHours();
	return hours < 7 || hours > 20;
};

export const notifyAllUsers = internalAction({
	handler: async (ctx) => {
		if (doNotDisturb()) {
			console.log("Do not disturb.");
			return;
		}
		const subscriptions = await ctx.runQuery(
			internal.subscriptions.getAllSubscriptions,
		);
		await Promise.all(
			subscriptions.map((subscription) => notifyUser(ctx, subscription)),
		);
	},
});
