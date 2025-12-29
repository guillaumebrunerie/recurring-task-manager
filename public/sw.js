import { ConvexClient } from "https://esm.sh/convex/browser";
import { anyApi } from "https://esm.sh/convex/server";

/** Installation and activation */

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

/** Receiving push notifications */

self.addEventListener("push", (event) => {
	if (event.data) {
		const { taskId, taskName, isLate, convexUrl, subscription } =
			event.data.json();
		const title = isLate ? "En retard ⚠️" : "À faire";
		const options = {
			body: taskName,
			badge: isLate ? "/badge-sad.svg" : "/badge-happy.svg",
			data: {
				taskId,
				convexUrl,
				subscription,
			},
			icon: "/icon.png",
			tag: `task=${taskId}`,
			actions: [
				{
					action: "add-accomplishment",
					title: "Marquer comme effectué",
					type: "button",
				},
			],
		};
		event.waitUntil(self.registration.showNotification(title, options));
	}
});

/** Clicking on notifications */

// Clicking on the "Mark as done" button
const addAccomplishment = async (notification) => {
	const { title, body, badge, data, icon, tag, actions } = notification;
	const { convexUrl, taskId, subscription } = data;
	const convexClient = new ConvexClient(convexUrl);
	await self.registration.showNotification(title + " (veuillez patienter)", {
		body,
		badge,
		data,
		icon,
		tag,
		// No more actions
	});
	try {
		await convexClient.mutation(anyApi.accomplishments.addAccomplishment, {
			taskId,
			completionTime: Date.now(),
			updateToBeDoneTime: true,
			subscription,
		});
		notification.close();
	} catch (error) {
		await self.registration.showNotification(title + " (erreur)", {
			body: error.message,
			badge,
			data,
			icon,
			tag,
			actions,
		});
	}
};

// Clicking on the notification itself
const openUrl = async (notification) => {
	const { taskId } = notification.data;
	const url = `https://project-happy-home.netlify.app/?task=${taskId}`;
	const windowClients = await self.clients.matchAll();
	if (windowClients.length > 0) {
		const client = windowClients[0];
		await client.navigate(url);
		await client.focus();
	} else {
		await self.clients.openWindow(url);
	}
	notification.close();
};

self.addEventListener("notificationclick", (event) => {
	const { action, notification } = event;
	switch (action) {
		case "add-accomplishment":
			event.waitUntil(addAccomplishment(notification));
		default:
			event.waitUntil(openUrl(notification));
	}
});

/** Receiving messages from the main thread */

const closeRelatedNotifications = async (taskId) => {
	const notifications = await self.registration.getNotifications();
	for (const notification of notifications) {
		if (notification.data?.taskId == taskId) {
			notification.close();
		}
	}
};

self.addEventListener("message", (event) => {
	switch (event.data?.type) {
		case "task-completed":
			event.waitUntil(closeRelatedNotifications(event.data.taskId));
	}
});
