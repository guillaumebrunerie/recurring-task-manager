"use node";

import webpush from "web-push";

import { ActionCtx, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { Task } from "@/shared/tasks";
/** Configuration */

webpush.setVapidDetails(
	"mailto:guillaume.brunerie@gmail.com",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!,
);

/** Helper functions */

const sendNotification = async ({
	title,
	task,
	subscription,
	isSad,
}: {
	title: string;
	task: Task;
	subscription: string;
	isSad: boolean;
}) => {
	try {
		console.log("Sending notification", title, task.name);
		await webpush.sendNotification(
			JSON.parse(subscription),
			JSON.stringify({
				title,
				body: task.name,
				data: {
					url: `https://project-happy-home.netlify.app/?task=${task.id}`,
				},
				badge: isSad ? "/badge-sad.svg" : "/badge-happy.svg",
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
	ignoreLastNotified = false,
) => {
	const { overdueTasks, dueTasks } = await ctx.runQuery(
		internal.tasks.getTasksToNotifyForUser,
		{ userId, ignoreLastNotified },
	);
	const user = await ctx.runQuery(api.users.getUser, { userId });
	console.log(
		`Notifying user ${user?.name}: ${overdueTasks.length} overdue, ${dueTasks.length} due`,
	);
	for (const task of dueTasks) {
		await sendNotification({
			title: `À faire`,
			task,
			subscription,
			isSad: false,
		});
	}
	for (const task of overdueTasks) {
		await sendNotification({
			title: `⚠️ En retard!`,
			task,
			subscription,
			isSad: true,
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
