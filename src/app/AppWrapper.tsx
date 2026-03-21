"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useRef, useState, type ReactNode } from "react";

import type { User } from "@/shared/users";

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

const AuthenticatedOrAuthLoading = ({ children }: { children: ReactNode }) => {
	return (
		<>
			<Authenticated>{children}</Authenticated>
			<AuthLoading>{children}</AuthLoading>
		</>
	);
};

export const AppWrapper = ({
	title,
	children,
	footer,
	search,
	onSearchChange,
	currentUser,
}: {
	title: ReactNode;
	children: ReactNode;
	footer: ReactNode;
	search?: string;
	onSearchChange?: (value: string) => void;
	currentUser?: User | null;
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
				<AuthenticatedOrAuthLoading>
					<NotificationsButton notifications={notifications} />
				</AuthenticatedOrAuthLoading>
				<Unauthenticated>
					<div />
				</Unauthenticated>
				<h1 className={styles.title}>{title}</h1>
				<AuthenticatedOrAuthLoading>
					<SignOut
						notifications={notifications}
						currentUser={currentUser}
					/>
				</AuthenticatedOrAuthLoading>
			</header>
			<main className={styles.contents}>
				<Unauthenticated>
					<SignIn />
				</Unauthenticated>
				<AuthenticatedOrAuthLoading>
					{children}
				</AuthenticatedOrAuthLoading>
			</main>
			<AuthenticatedOrAuthLoading>
				<footer className={styles.footer}>
					{onSearchChange !== undefined &&
						(isSearchOpen ?
							<input
								ref={inputRef}
								className={`${isClosing ? styles.searchInputClosing : styles.searchInput}${search ? ` ${styles.searchInputActive}` : ""}`}
								type="search"
								placeholder="Rechercher…"
								value={search ?? ""}
								onChange={(e) => onSearchChange(e.target.value)}
								onBlur={handleBlur}
							/>
						:	<button
								className={styles.searchButton}
								onClick={openSearch}
								aria-label="Rechercher"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="10" cy="10" r="7" />
									<line
										x1="15.24"
										y1="15.24"
										x2="21"
										y2="21"
									/>
								</svg>
							</button>)}
					{footer}
				</footer>
			</AuthenticatedOrAuthLoading>
		</div>
	);
};
