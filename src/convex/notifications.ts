"use node";

import webpush, { WebPushError } from "web-push";

import { type ActionCtx, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import type { Task } from "@/shared/tasks";
import { v } from "convex/values";

/** Configuration */

webpush.setVapidDetails(
	"mailto:guillaume.brunerie@gmail.com",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!,
);

/** Helper functions */

type NotificationData = {
	taskId: string;
	taskName: string;
	isLate: boolean;
	convexUrl: string | undefined;
	subscription: string;
};

type SendNotificationArgs = {
	subscription: string;
	task: Task;
	isLate: boolean;
};

const sendNotification = async ({
	subscription,
	task,
	isLate,
}: SendNotificationArgs): Promise<{ removeSubscription: boolean }> => {
	try {
		console.log(
			`Sending notification for '${task.name}' (late: ${isLate})`,
		);
		const data: NotificationData = {
			taskId: task.id,
			taskName: task.name,
			isLate,
			convexUrl: process.env.CONVEX_CLOUD_URL,
			subscription,
		};
		await webpush.sendNotification(
			JSON.parse(subscription),
			JSON.stringify(data),
		);
	} catch (error) {
		if (
			error instanceof WebPushError &&
			[404, 410].includes(error.statusCode)
		) {
			return { removeSubscription: true };
		}
		console.error("Error sending push notification:", error);
	}
	return { removeSubscription: false };
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
	const user = await ctx.runQuery(api.users.getUserQuery, { userId });
	console.log(
		`Notifying user ${user?.name}: ${overdueTasks.length} overdue, ${dueTasks.length} due`,
	);
	for (const task of dueTasks) {
		await sendNotification({
			subscription,
			task,
			isLate: false,
		});
	}
	for (const task of overdueTasks) {
		const { removeSubscription } = await sendNotification({
			subscription,
			task,
			isLate: true,
		});
		if (removeSubscription) {
			await ctx.runMutation(internal.subscriptions.removeSubscription, {
				subscription,
			});
		}
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
		if (process.env.ENABLE_CRON_NOTIFICATIONS !== "true") {
			return;
		}
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
	args: { name: v.optional(v.string()) },
	handler: async (ctx, { name }) => {
		const subscriptions = await ctx.runQuery(
			internal.subscriptions.getByUserName,
			{ userName: name || "Guillaume Brunerie" },
		);
		await Promise.all(
			subscriptions.map((subscription) =>
				notifyUser(ctx, subscription, true),
			),
		);
	},
});
