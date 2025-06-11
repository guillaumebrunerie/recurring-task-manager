"use node";

import webpush from "web-push";

import { v } from "convex/values";
import { action } from "./_generated/server";

webpush.setVapidDetails(
	"mailto:guillaume.brunerie@gmail.com",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!,
);

/** Actions */

export const sendNotification = action({
	args: {
		message: v.string(),
		subscription: v.string(),
	},
	handler: async (_, { message, subscription }) => {
		try {
			await webpush.sendNotification(
				JSON.parse(subscription),
				JSON.stringify({
					title: "Test Notification",
					body: message,
					icon: "/icon.png",
				}),
			);
			return { success: true };
		} catch (error) {
			console.error("Error sending push notification:", error);
			return { success: false, error: "Failed to send notification" };
		}
	},
});
