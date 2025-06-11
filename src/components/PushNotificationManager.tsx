"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState, useEffect } from "react";
import * as styles from "./profileMenu.css";

function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/-/g, "+")
		.replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export const PushNotificationManager = () => {
	const [, setIsSupported] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null,
	);

	useEffect(() => {
		if ("serviceWorker" in navigator && "PushManager" in window) {
			setIsSupported(true);
			registerServiceWorker();
		}
	}, []);

	const subscribeUser = useMutation(api.users.subscribe);

	async function registerServiceWorker() {
		const registration = await navigator.serviceWorker.register("/sw.js", {
			scope: "/",
			updateViaCache: "none",
		});
		const sub = await registration.pushManager.getSubscription();
		setSubscription(sub);
	}

	async function subscribeToPush() {
		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(
				process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
			),
		});
		setSubscription(sub);
		const subscription = JSON.stringify(sub);
		await subscribeUser({ subscription });
	}

	// async function unsubscribeFromPush() {
	// 	await subscription?.unsubscribe();
	// 	setSubscription(null);
	// 	await unsubscribeUser();
	// }

	return (
		<div onClick={subscribeToPush} className={styles.dropdownItem}>
			{subscription ?
				"Notifications activées"
			:	"Notifications désactivées"}
		</div>
	);
};
