import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import type { MessageData, PushMessageData } from "@/shared/messages";

declare const self: ServiceWorkerGlobalScope;

/** Installation and activation */

self.addEventListener("install", () => {
	void self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

/** Receiving push notifications */

type NotificationData = {
	taskId: Id<"tasks">;
	convexUrl: string;
	subscription: string;
	count: number;
};

const openNotification = async ({
	taskId,
	taskName,
	isLate,
	convexUrl,
	subscription,
}: PushMessageData) => {
	const notifications = await self.registration.getNotifications();
	const previousNotification = notifications.find(
		(notification) =>
			(notification.data as NotificationData).taskId === taskId,
	);
	const count =
		previousNotification && isLate ?
			(previousNotification.data as NotificationData).count + 1
		:	1;
	const title =
		isLate ?
			count > 1 ?
				`En retard ⚠️ (rappel ${count})`
			:	"En retard ⚠️"
		:	"À faire";
	const notificationData: NotificationData = {
		taskId,
		convexUrl,
		subscription,
		count,
	};
	const options = {
		body: taskName,
		badge: isLate ? "/badge-sad.svg" : "/badge-happy.svg",
		data: notificationData,
		icon: "/icon.png",
		tag: `task=${taskId}`,
		renotify: true,
		actions: [
			{
				action: "add-accomplishment",
				title: "Marquer comme effectué",
				type: "button",
			},
			// { action: "test", title: "TEST", type: "button" },
		],
	};
	await self.registration.showNotification(title, options);
};

self.addEventListener("push", (event) => {
	if (event.data) {
		event.waitUntil(openNotification(event.data.json() as PushMessageData));
	}
});

const log = async (...args: unknown[]) => {
	await fetch("/api/log", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ args }),
	});
};

self.addEventListener("fetch", (event) => {
	log("SW fetch:", event.request.url);
	log("method:", event.request.method);
	log("mode:", event.request.mode);
	event.request.headers.forEach((value, key) => {
		log(`header: ${key}=${value}`);
	});
});

/** Clicking on notifications */

// Clicking on the "Mark as done" button
const addAccomplishment = async (notification: Notification) => {
	const { title, body, icon, tag } = notification;
	const data = notification.data as NotificationData;
	const { convexUrl, taskId, subscription } = data;
	await self.registration.showNotification(title, {
		body,
		badge: "/badge-loading.svg",
		data,
		icon,
		tag,
	});
	try {
		const args = {
			taskId,
			completionTime: Date.now(),
			updateToBeDoneTime: true,
			subscription,
		};

		// Raw fetch
		const url = convexUrl + "/api/run/accomplishments/addAccomplishment";
		await self.registration.showNotification(
			"Raw fetch with no json: " + url,
		);
		await fetch(url, {
			method: "POST",
			// headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ args, format: "json" }),
		});

		// // Convex HTTP client
		// const convexClient = new ConvexHttpClient(convexUrl);
		// await self.registration.showNotification(
		// 	"Created convexHttpClient: " + convexUrl,
		// );
		// await convexClient.mutation(
		// 	api.accomplishments.addAccomplishment,
		// 	args,
		// );

		await self.registration.showNotification("Sent accomplishment");
		notification.close();
	} catch (error) {
		await self.registration.showNotification("Erreur", {
			body: String(error),
			badge: "/badge-sad.svg",
			data,
		});
	}
};

// Clicking on the "Mark as done" button
const test = async (notification: Notification) => {
	const { title, body, icon, tag } = notification;
	const data = notification.data as NotificationData;
	const convexUrl = "https://grandiose-dragon-624.convex.cloud";
	await self.registration.showNotification(title, {
		body,
		badge: "/badge-loading.svg",
		data,
		icon,
		tag,
	});
	try {
		const convexClient = new ConvexHttpClient(convexUrl);
		await self.registration.showNotification(
			"TEST Created convexHttpClient: " + convexUrl,
		);
		await convexClient.mutation(
			api.accomplishments.addAccomplishment,
			{} as never,
		);
		await self.registration.showNotification("TEST Sent accomplishment");
		notification.close();
	} catch (error) {
		await self.registration.showNotification("Erreur", {
			body: String(error),
			badge: "/badge-sad.svg",
			data,
		});
	}
};

// Clicking on the notification itself
const openUrl = async (notification: Notification) => {
	const { taskId } = notification.data as NotificationData;
	const url = `${location.origin}/?task=${taskId}`;
	notification.close();
	const windowClients = await self.clients.matchAll({
		type: "window",
		includeUncontrolled: true,
	});
	if (windowClients.length > 0) {
		const client = windowClients.find((c) => c.focused) ?? windowClients[0];
		await Promise.all([client.focus(), client.navigate(url)]);
	} else {
		await self.clients.openWindow(url);
	}
};

self.addEventListener("notificationclick", (event) => {
	const { action, notification } = event;
	switch (action) {
		case "add-accomplishment":
			event.waitUntil(addAccomplishment(notification));
			break;
		// case "test":
		// 	event.waitUntil(test(notification));
		// 	break;
		default:
			event.waitUntil(openUrl(notification));
			break;
	}
});

/** Receiving messages from the main thread */

const closeRelatedNotifications = async (taskId: string) => {
	const notifications = await self.registration.getNotifications();
	for (const notification of notifications) {
		if ((notification.data as NotificationData).taskId == taskId) {
			notification.close();
		}
	}
};

self.addEventListener("message", (event) => {
	const data = event.data as MessageData;
	switch (data.type) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		case "task-completed":
			event.waitUntil(closeRelatedNotifications(data.taskId));
			break;
		default:
			// Unknown message type
			break;
	}
});
