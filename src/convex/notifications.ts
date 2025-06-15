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

const sendNotification = async ({
	title,
	body,
	subscription,
	isSad,
}: {
	title: string;
	body: string;
	subscription: string;
	isSad: boolean;
}) => {
	try {
		console.log("Sending notification", title, body);
		await webpush.sendNotification(
			JSON.parse(subscription),
			JSON.stringify({
				title,
				body,
				badge: isSad ? "/badge-sad.svg" : "/badge-happy.svg",
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
	ignoreLastNotified = false,
) => {
	const { overdueTasks, dueTasks } = await ctx.runQuery(
		internal.tasks.getTasksToNotifyForUser,
		{ userId, ignoreLastNotified },
	);
	console.log(
		`Notifying user ${userId}: ${overdueTasks.length} overdue, ${dueTasks.length} due`,
	);
	if (overdueTasks.length > 0) {
		await sendNotification({
			title: `⚠️ ${countStr(overdueTasks.length, "tâche")} en retard!`,
			body: listify(overdueTasks),
			subscription,
			isSad: true,
		});
	}
	if (dueTasks.length > 0) {
		await sendNotification({
			title: `${countStr(dueTasks.length, "tâche")} à faire`,
			body: listify(dueTasks),
			subscription,
			isSad: false,
		});
	}
	if (!ignoreLastNotified) {
		await ctx.runMutation(internal.tasks.markTasksAsNotified, {
			ids: [
				...overdueTasks.map((task) => task.id),
				...dueTasks.map((task) => task.id),
			],
			now: Date.now(),
		});
	}
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

export const notifyTest = internalAction({
	handler: async (ctx) => {
		const subscriptions = await ctx.runQuery(
			internal.subscriptions.getByUserName,
			{ userName: "Guillaume Brunerie" },
		);
		await Promise.all(
			subscriptions.map((subscription) =>
				notifyUser(ctx, subscription, true),
			),
		);
	},
});
