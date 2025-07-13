self.addEventListener("push", function (event) {
	if (event.data) {
		const data = event.data.json();
		const options = {
			body: data.body,
			badge: data.badge,
			data: data.data,
			icon: "/icon.png",
		};
		event.waitUntil(
			self.registration.showNotification(data.title, options),
		);
	}
});

self.addEventListener("notificationclick", function (event) {
	event.notification.close();
	event.waitUntil(clients.openWindow(event.notification.data.url));
});
