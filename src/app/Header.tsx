"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { usePreloadedQuery, type Preloaded } from "convex/react";

import type { api } from "@/convex/_generated/api";

import type { User } from "@/shared/users";

import { NotificationsOff } from "@/components/NotificationsOff";
import { NotificationsOn } from "@/components/NotificationsOn";
import { ProfileMenu } from "@/components/ProfileMenu";
import { Spinner } from "@/components/Spinner";
import {
	usePushNotificationManager,
	type NotificationsProps,
} from "@/components/usePushNotificationManager";

type HeaderClientProps = {
	preloadedUser: Preloaded<typeof api.users.getCurrentUserQuery>;
};

export const HeaderClient = ({ preloadedUser }: HeaderClientProps) => {
	const user = usePreloadedQuery(preloadedUser);
	const notifications = usePushNotificationManager();

	if (!user) {
		return;
	}

	return (
		<>
			<NotificationsButton notifications={notifications} />
			<SignOut notifications={notifications} currentUser={user} />
		</>
	);
};

type NotificationsButtonProps = { notifications: NotificationsProps };

const NotificationsButton = ({ notifications }: NotificationsButtonProps) => {
	const { state, toggleSubscription } = notifications;
	switch (state) {
		case "unsupported":
			return <div />;
		case "pending":
			return <Spinner scale={1.2} noMarginRight />;
		case "unsubscribed":
			return <NotificationsOff onClick={toggleSubscription} />;
		case "subscribed":
			return <NotificationsOn onClick={toggleSubscription} />;
	}
};

const defaultUserImage = "";

type SignOutProps = {
	notifications: NotificationsProps;
	currentUser?: User | null;
};

const SignOut = ({ notifications, currentUser }: SignOutProps) => {
	const { signOut } = useAuthActions();
	return (
		<ProfileMenu
			imageUrl={currentUser?.image || defaultUserImage}
			onSignOut={() => void signOut()}
			notifications={notifications}
		/>
	);
};
