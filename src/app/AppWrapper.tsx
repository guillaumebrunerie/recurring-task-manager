"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { type ReactNode, useRef, useState } from "react";

import { NotificationsOff } from "@/components/NotificationsOff";
import { NotificationsOn } from "@/components/NotificationsOn";
import { SignIn } from "@/components/SignIn";
import { SignOut } from "@/components/SignOut";
import { Spinner } from "@/components/Spinner";
import {
	usePushNotificationManager,
	type NotificationsProps,
} from "@/components/usePushNotificationManager";

import * as styles from "./appWrapper.css";
import * as common from "./common.css";

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
	search,
	onSearchChange,
}: {
	title: ReactNode;
	children: ReactNode;
	footer: ReactNode;
	search?: string;
	onSearchChange?: (value: string) => void;
}) => {
	const notifications = usePushNotificationManager();
	const [isSearchOpen, setIsSearchOpen] = useState(!!search);
	const [isClosing, setIsClosing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const openSearch = () => {
		setIsSearchOpen(true);
		setIsClosing(false);
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	const handleBlur = () => {
		if (!search) {
			setIsClosing(true);
			setTimeout(() => {
				setIsSearchOpen(false);
				setIsClosing(false);
			}, 200);
		}
	};

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
				<footer className={styles.footer}>
					{onSearchChange !== undefined && (
						isSearchOpen ? (
							<input
								ref={inputRef}
								className={`${isClosing ? styles.searchInputClosing : styles.searchInput}${search ? ` ${styles.searchInputActive}` : ""}`}
								type="search"
								placeholder="Rechercher…"
								value={search ?? ""}
								onChange={(e) => onSearchChange(e.target.value)}
								onBlur={handleBlur}
							/>
						) : (
							<button
								className={styles.searchButton}
								onClick={openSearch}
								aria-label="Rechercher"
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<circle cx="10" cy="10" r="7" />
									<line x1="15.24" y1="15.24" x2="21" y2="21" />
								</svg>
							</button>
						)
					)}
					{footer}
				</footer>
			</Authenticated>
		</div>
	);
};
