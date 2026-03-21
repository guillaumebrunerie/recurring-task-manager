"use node";

import { v } from "convex/values";
import webpush, { WebPushError, type PushSubscription } from "web-push";

import { api, internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { internalAction, type ActionCtx } from "./_generated/server";

import type { PushMessageData } from "@/shared/messages";
import { publicEnv } from "@/shared/publicEnv";
import type { Task } from "@/shared/tasks";

import { privateEnv } from "./env";

/** Configuration */

webpush.setVapidDetails(
	privateEnv.VAPID_CONTACT_EMAIL,
	publicEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
	privateEnv.VAPID_PRIVATE_KEY,
);

/** Helper functions */

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
		const data: PushMessageData = {
			taskId: task.id,
			taskName: task.name,
			isLate,
			convexUrl: publicEnv.NEXT_PUBLIC_CONVEX_URL,
			subscription,
		};
		await webpush.sendNotification(
			JSON.parse(subscription) as PushSubscription,
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
		`Notifying user ${user?.name || "(unknown)"}: ${overdueTasks.length} overdue, ${dueTasks.length} due`,
	);
	for (const task of dueTasks) {
		await sendNotification({ subscription, task, isLate: false });
	}
	for (const task of overdueTasks) {
		const { removeSubscription } = await sendNotification({
			subscription,
			task,
			isLate: true,
		});
		if (removeSubscription) {
			await ctx.scheduler.runAfter(
				1000,
				internal.subscriptions.removeSubscription,
				{ subscription },
			);
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
	args: {},
	handler: async (ctx) => {
		if (privateEnv.CRON_NOTIFICATIONS_ENABLED !== "true") {
			return;
		}
		if (doNotDisturb()) {
			console.log("Do not disturb.");
			return;
		}
		const subscriptions = await ctx.runQuery(
			internal.subscriptions.getAllSubscriptions,
		);
		for (const subscription of subscriptions) {
			await notifyUser(ctx, subscription);
		}
	},
});

export const notifyTest = internalAction({
	args: { name: v.optional(v.string()) },
	handler: async (ctx, { name }) => {
		console.log(
			"Temporal in node:",
			(window as unknown as { Temporal: unknown }).Temporal,
		);
		const subscriptions = await ctx.runQuery(
			internal.subscriptions.getByUserName,
			{ userName: name || "Guillaume Brunerie" },
		);
		for (const subscription of subscriptions) {
			await notifyUser(ctx, subscription, true);
		}
	},
});
