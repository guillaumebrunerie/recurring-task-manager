"use client";

import { SignIn } from "@/components/SignIn";
import { SignOut } from "@/components/SignOut";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { ReactNode } from "react";
import * as styles from "@/components/styles.css";
import * as common from "@/app/common.css";
import { useRouter } from "next/navigation";

const BackButton = () => {
	const router = useRouter();
	return (
		<button onClick={() => router.back()} className={styles.backButton}>
			← Retour
		</button>
	);
};

export const App = ({
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
			</Authenticated>
		</div>
	);
};
