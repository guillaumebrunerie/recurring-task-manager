self.addEventListener("push", function (event) {
	if (event.data) {
		const data = event.data.json();
		const options = {
			body: data.body,
			badge: "/icon.png",
		};
		event.waitUntil(
			self.registration.showNotification(data.title, options),
		);
	}
});

self.addEventListener("notificationclick", function (event) {
	event.notification.close();
	event.waitUntil(
		clients.openWindow("https://project-happy-home.netlify.app/"),
	);
});
