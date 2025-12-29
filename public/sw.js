import { ConvexClient } from "https://esm.sh/convex@1.27.5/browser";
import { anyApi } from "https://esm.sh/convex@1.27.5/server";

/** Installation and activation */

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

/** Receiving push notifications */

const openNotification = async ({
	taskId,
	taskName,
	isLate,
	convexUrl,
	subscription,
}) => {
	const notifications = await registration.getNotifications();
	const previousNotification = notifications.find(
		(notification) => notification.data?.taskId === taskId,
	);
	const count =
		previousNotification && isLate ?
			previousNotification.data.count + 1
		:	1;
	const title =
		isLate ?
			count > 1 ?
				`En retard ⚠️ (rappel ${count})`
			:	"En retard ⚠️"
		:	"À faire";
	const options = {
		body: taskName,
		badge: isLate ? "/badge-sad.svg" : "/badge-happy.svg",
		data: {
			taskId,
			convexUrl,
			subscription,
			count,
		},
		icon: "/icon.png",
		tag: `task=${taskId}`,
		renotify: true,
		actions: [
			{
				action: "add-accomplishment",
				title: "Marquer comme effectué",
				type: "button",
			},
		],
	};
	await self.registration.showNotification(title, options);
};

self.addEventListener("push", (event) => {
	if (event.data) {
		event.waitUntil(openNotification(event.data.json()));
	}
});

/** Clicking on notifications */

// Clicking on the "Mark as done" button
const addAccomplishment = async (notification) => {
	const { title, body, data, icon, tag } = notification;
	const { convexUrl, taskId, subscription } = data;
	self.registration.showNotification(title, {
		body,
		badge: "/badge-loading.svg",
		data,
		icon,
		tag,
	});
	try {
		const convexClient = new ConvexClient(convexUrl);
		await convexClient.mutation(anyApi.accomplishments.addAccomplishment, {
			taskId,
			completionTime: Date.now(),
			updateToBeDoneTime: true,
			subscription,
		});
		notification.close();
	} catch (error) {
		await self.registration.showNotification("Erreur", {
			body: error.message,
			badge: "/badge-sad.svg",
			data,
		});
	}
};

// Clicking on the notification itself
const openUrl = async (notification) => {
	const { taskId } = notification.data;
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
		default:
			event.waitUntil(openUrl(notification));
			break;
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
			break;
	}
});
