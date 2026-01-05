"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import type { ReactNode } from "react";

import { SignIn } from "@/components/SignIn";
import { SignOut } from "@/components/SignOut";

import * as styles from "./appWrapper.css";
import * as common from "./common.css";
import { NotificationsOn } from "@/components/NotificationsOn";
import { NotificationsOff } from "@/components/NotificationsOff";
import {
	usePushNotificationManager,
	type NotificationsProps,
} from "@/components/usePushNotificationManager";
import { Spinner } from "@/components/Spinner";

type NotificationsButtonProps = { notifications: NotificationsProps };
const NotificationsButton = ({ notifications }: NotificationsButtonProps) => {
	switch (notifications.state) {
		case "unsupported":
			return <div />;
		case "pending":
			return <Spinner />;
		case "unsubscribed":
			return (
				<NotificationsOff onClick={notifications.toggleSubscription} />
			);
		case "subscribed":
			return (
				<NotificationsOn onClick={notifications.toggleSubscription} />
			);
	}
};

export const AppWrapper = ({
	title,
	children,
	footer,
}: {
	title: ReactNode;
	children: ReactNode;
	footer: ReactNode;
}) => {
	const notifications = usePushNotificationManager();
	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<Authenticated>
					<NotificationsButton notifications={notifications} />
				</Authenticated>
				<Unauthenticated>
					<div />
				</Unauthenticated>
				<h1 className={common.title}>{title}</h1>
				<Authenticated>
					<SignOut notifications={notifications} />
				</Authenticated>
			</header>
			<main className={styles.contents}>
				<AuthLoading>Chargement...</AuthLoading>
				<Unauthenticated>
					<SignIn />
				</Unauthenticated>
				<Authenticated>{children}</Authenticated>
			</main>
			<Authenticated>
				<footer className={styles.footer}>{footer}</footer>
			</Authenticated>
		</div>
	);
};
