import { ConvexClient } from "https://esm.sh/convex/browser";
import { anyApi } from "https://esm.sh/convex/server";

self.addEventListener("install", function () {
	self.skipWaiting();
});

self.addEventListener("activate", function (event) {
	event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
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
			self.registration.showNotification(data.title + "--1", options),
		);
	}
});

self.addEventListener("notificationclick", function (event) {
	const { CONVEX_URL, taskId, url } = event.notification.data;
	if (event.action === "add-accomplishment") {
		console.log(CONVEX_URL);
		const convexClient = new ConvexClient(CONVEX_URL);
		console.log(convexClient);
		event.waitUntil(
			convexClient.mutation(anyApi.accomplishments.addAccomplishment, {
				taskId,
				completionTime: Date.now(),
				updateToBeDoneTime: true,
			}),
		);
	} else {
		event.notification.close();
		event.waitUntil(clients.openWindow(url));
	}
});
