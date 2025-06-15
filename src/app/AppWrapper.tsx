"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { SignIn } from "@/components/SignIn";
import { SignOut } from "@/components/SignOut";

import * as styles from "./appWrapper.css";
import * as common from "./common.css";

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
	footer,
}: {
	title: ReactNode;
	withBackButton?: boolean;
	children: ReactNode;
	footer: ReactNode;
}) => {
	return (
		<div className={styles.container}>
			<header className={styles.header}>
				{withBackButton && <BackButton />}
				<h1 className={common.title}>{title}</h1>
				<Authenticated>
					<SignOut />
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
