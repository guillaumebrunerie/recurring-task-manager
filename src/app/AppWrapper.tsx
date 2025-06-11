"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { SignIn } from "@/components/SignIn";
import { SignOut } from "@/components/SignOut";

import * as styles from "./appWrapper.css";
import * as common from "./common.css";
import { PushNotificationManager } from "./PushNotificationManager";

const BackButton = () => {
	const router = useRouter();
	return (
		<button onClick={() => router.back()} className={styles.backButton}>
			← Retour
		</button>
	);
};

export const AppWrapper = ({
	title,
	withBackButton,
	children,
}: {
	title: ReactNode;
	withBackButton?: boolean;
	children: ReactNode;
}) => {
	return (
		<div className={styles.container}>
			{withBackButton && <BackButton />}
			<h1 className={common.title}>{title}</h1>
			<AuthLoading>Chargement...</AuthLoading>
			<Unauthenticated>
				<SignIn />
			</Unauthenticated>
			<Authenticated>
				<SignOut />
				{children}
				<PushNotificationManager />
			</Authenticated>
		</div>
	);
};
