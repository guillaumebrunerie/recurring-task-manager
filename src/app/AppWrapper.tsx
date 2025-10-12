"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import type { ReactNode } from "react";

import { SignIn } from "@/components/SignIn";
import { SignOut } from "@/components/SignOut";

import * as styles from "./appWrapper.css";
import * as common from "./common.css";
import { NotificationsOn } from "@/components/NotificationsOn";
import { NotificationsOff } from "@/components/NotificationsOff";
import { usePushNotificationManager } from "@/components/usePushNotificationManager";

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
					{notifications.isSubscribed ?
						<NotificationsOn
							onClick={notifications.toggleSubscription}
						/>
					:	<NotificationsOff
							onClick={notifications.toggleSubscription}
						/>
					}
				</Authenticated>
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
