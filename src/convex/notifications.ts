"use node";

import { v } from "convex/values";
import webpush, { WebPushError, type PushSubscription } from "web-push";

import { api, internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { internalAction, type ActionCtx } from "./_generated/server";

import type { PushMessageData } from "@/shared/messages";
import type { Task } from "@/shared/tasks";

import { convexEnv } from "./convexEnv";

/** Configuration */

webpush.setVapidDetails(
	convexEnv.VAPID_CONTACT_EMAIL,
	convexEnv.VAPID_PUBLIC_KEY,
	convexEnv.VAPID_PRIVATE_KEY,
);

/** Helper functions */

type SendNotificationArgs = {
	subscription: string;
	task: Task;
	isLate: boolean;
};

type SendNotificationResult =
	| { success: true }
	| { success: false; removeSubscription: boolean; errorMessage: string };

const getErrorMessage = (error: unknown) =>
	error instanceof Error ? error.message : String(error);

const sendTelegramNotification = async (message: string) => {
	const { TELEGRAM_BOT_TOKEN: botToken, TELEGRAM_CHAT_ID: chatId } =
		convexEnv;
	if (!botToken || !chatId) {
		return;
	}
	const response = await fetch(
		`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${encodeURIComponent(chatId)}&text=${encodeURIComponent(message)}`,
	);
	if (!response.ok) {
		console.error(
			"Error sending Telegram notification:",
			response.status,
			await response.text(),
		);
	}
};

const sendNotification = async ({
	subscription,
	task,
	isLate,
}: SendNotificationArgs): Promise<SendNotificationResult> => {
	try {
		console.log(
			`Sending notification for '${task.name}' (late: ${isLate})`,
		);
		const data: PushMessageData = {
			taskId: task.id,
			taskName: task.name,
			isLate,
			convexUrl: convexEnv.CONVEX_CLOUD_URL,
			subscription,
		};
		await webpush.sendNotification(
			JSON.parse(subscription) as PushSubscription,
			JSON.stringify(data),
		);
		return { success: true };
	} catch (error) {
		if (
			error instanceof WebPushError &&
			[404, 410].includes(error.statusCode)
		) {
			return {
				success: false,
				removeSubscription: true,
				errorMessage: `Subscription expired (${error.statusCode})`,
			};
		}
		console.error("Error sending push notification:", error);
		return {
			success: false,
			removeSubscription: false,
			errorMessage: getErrorMessage(error),
		};
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
	const user = await ctx.runQuery(api.users.getUserQuery, { userId });
	const userName = user?.name || "(unknown)";
	console.log(
		`Notifying user ${userName}: ${overdueTasks.length} overdue, ${dueTasks.length} due`,
	);
	const notifiedTaskIds: Task["id"][] = [];
	const failedNotifications: string[] = [];
	const processTasks = async (tasks: Task[], isLate: boolean) => {
		for (const task of tasks) {
			const result = await sendNotification({
				subscription,
				task,
				isLate,
			});
			if (result.success) {
				notifiedTaskIds.push(task.id);
			} else {
				failedNotifications.push(
					`- ${task.name}: ${result.errorMessage}`,
				);
				if (result.removeSubscription) {
					await ctx.scheduler.runAfter(
						1000,
						internal.subscriptions.removeSubscription,
						{ subscription },
					);
				}
			}
		}
	};
	await processTasks(dueTasks, false);
	await processTasks(overdueTasks, true);
	if (failedNotifications.length > 0) {
		const failuresToReport = failedNotifications.slice(0, 10);
		const remainingFailuresCount =
			failedNotifications.length - failuresToReport.length;
		const telegramMessage = [
			"⚠️ Happy Home: échec d'envoi de notification push",
			`Utilisateur: ${userName}`,
			`Date: ${new Date().toISOString()}`,
			"Erreurs:",
			...failuresToReport,
			remainingFailuresCount > 0 ?
				`- ... ${remainingFailuresCount} autres`
			:	"",
		]
			.filter((line) => line.length > 0)
			.join("\n");
		try {
			await sendTelegramNotification(telegramMessage);
		} catch (error) {
			console.error(
				"Error notifying Telegram about push failure:",
				error,
			);
		}
	}
	if (!ignoreLastNotified && notifiedTaskIds.length > 0) {
		await ctx.runMutation(internal.tasks.markTasksAsNotified, {
			ids: notifiedTaskIds,
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
		if (convexEnv.CRON_NOTIFICATIONS_ENABLED !== "true") {
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
		const subscriptions = await ctx.runQuery(
			internal.subscriptions.getByUserName,
			{ userName: name || "Guillaume Brunerie" },
		);
		for (const subscription of subscriptions) {
			await notifyUser(ctx, subscription, true);
		}
	},
});
