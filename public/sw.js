import { ConvexClient } from "https://esm.sh/convex/browser";
import { anyApi } from "https://esm.sh/convex/server";

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
	if (event.data) {
		const data = event.data.json();
		const options = {
			body: data.body,
			badge: data.badge,
			data: data.data,
			icon: "/icon.png",
			tag: data.tag,
			actions: [
				{
					action: "add-accomplishment",
					title: "Marquer comme effectué",
					type: "button",
				},
			],
		};
		event.waitUntil(
			self.registration.showNotification(data.title, options),
		);
	}
});

self.addEventListener("notificationclick", (event) => {
	const { CONVEX_URL, taskId, url, token } = event.notification.data;
	event.notification.close();
	if (event.action === "add-accomplishment") {
		const convexClient = new ConvexClient(CONVEX_URL);
		event.waitUntil(
			convexClient.mutation(anyApi.accomplishments.addAccomplishment, {
				taskId,
				completionTime: Date.now(),
				updateToBeDoneTime: true,
				token,
			}),
		);
	} else {
		event.waitUntil(
			self.clients.matchAll({ type: "window" }).then((clients) => {
				if (clients.length > 0) {
					const client = clients[0];
					event.waitUntil(client.navigate(url));
					event.waitUntil(client.focus());
				} else {
					event.waitUntil(clients.openWindow(url));
				}
			}),
		);
	}
});
